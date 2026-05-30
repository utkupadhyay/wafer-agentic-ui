import type { AgentTransport, SendUserMessageInput } from "@wafer/core";

interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

interface OpenAIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: string;
  }>;
}

interface OpenAIStreamChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface GroqFunctionTool {
  type?: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
  execute: (
    argumentsPayload: Record<string, unknown>,
    context: {
      threadId: string;
      runId: string;
      model: string;
      toolName: string;
    }
  ) => Promise<unknown> | unknown;
}

export interface CreateGroqTransportOptions {
  model?: string;
  endpoint?: string;
  systemPrompt?: string;
  tools?: GroqFunctionTool[];
  maxToolRounds?: number;
  forceToolCallRetryCount?: number;
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${id}`;
}

function toOpenAIMessages(input: SendUserMessageInput, systemPrompt?: string): OpenAIMessage[] {
  const history = input.history
    .filter((m) => ["system", "user", "assistant"].includes(m.role))
    .map((m) => ({ role: m.role as OpenAIMessage["role"], content: m.content }));

  if (!systemPrompt) return history;
  return [{ role: "system", content: systemPrompt }, ...history];
}

async function parseSSEStream(response: Response, onChunk: (chunk: OpenAIStreamChunk) => void) {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line === "data: [DONE]") continue;
      if (line.startsWith("data: ")) {
        onChunk(JSON.parse(line.slice(6)) as OpenAIStreamChunk);
      }
    }
  }

  const pending = buffer.trim();
  if (pending && pending !== "data: [DONE]" && pending.startsWith("data: ")) {
    onChunk(JSON.parse(pending.slice(6)) as OpenAIStreamChunk);
  }
}

function normalizeToolArguments(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function stringifyToolOutput(output: unknown): string {
  if (typeof output === "string") return output;
  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
}

function buildForceToolCallMessage(toolNames: string[]) {
  return [
    "Tool use required for this turn.",
    "You must call at least one tool before your final assistant response.",
    `Available tools: ${toolNames.join(", ")}.`
  ].join(" ");
}

export function createGroqTransport(options: CreateGroqTransportOptions): AgentTransport {
  const endpoint = options.endpoint ?? "/api/chat";
  const model = options.model ?? "llama-3.3-70b-versatile";
  const configuredTools = options.tools ?? [];
  const maxToolRounds = Math.max(1, options.maxToolRounds ?? 6);
  const forceToolCallRetryCount = Math.max(0, options.forceToolCallRetryCount ?? 0);

  const toolSchemas = configuredTools.map((t) => ({
    type: (t.type ?? "function") as "function",
    function: t.function
  }));
  const toolsByName = new Map(configuredTools.map((t) => [t.function.name, t]));

  let persistedMessages: OpenAIMessage[] | null = null;

  return {
    async sendUserMessage(input, emit) {
      const assistantMessageId = createId("msg");
      let assistantText = "";
      let completed = false;

      emit({
        type: "message.created",
        threadId: input.threadId,
        messageId: assistantMessageId,
        role: "assistant",
        runId: input.runId,
        content: "",
        createdAt: nowIso()
      });

      if (configuredTools.length > 0) {
        if (persistedMessages === null) {
          persistedMessages = toOpenAIMessages(input, options.systemPrompt);
        } else {
          persistedMessages.push({ role: "user", content: input.text });
        }
        const messages = persistedMessages;
        let forcedRetryUsedCount = 0;

        for (let round = 0; round < maxToolRounds; round++) {
          const llmToolCallId = createId("tool");

          emit({
            type: "tool.called",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId: llmToolCallId,
            toolName: "groq.chat",
            input: {
              model,
              round: round + 1,
              toolsEnabled: toolSchemas.map((t) => t.function.name)
            },
            createdAt: nowIso()
          });

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, messages, tools: toolSchemas, stream: false })
          });

          if (!response.ok) {
            const details = await response.text();
            const errorMessage = `Groq request failed (${response.status}): ${details}`;
            emit({
              type: "tool.failed",
              threadId: input.threadId,
              runId: input.runId,
              toolCallId: llmToolCallId,
              error: errorMessage,
              createdAt: nowIso()
            });
            throw new Error(errorMessage);
          }

          const body = (await response.json()) as OpenAIChatResponse;
          const choice = body.choices[0];
          if (!choice) throw new Error("Groq returned no choices");

          const assistantMessage = choice.message;
          const toolCalls = assistantMessage.tool_calls ?? [];

          if (assistantMessage.content) {
            assistantText += assistantMessage.content;
            emit({
              type: "message.delta",
              threadId: input.threadId,
              messageId: assistantMessageId,
              runId: input.runId,
              delta: assistantMessage.content,
              createdAt: nowIso()
            });
          }

          messages.push({
            role: "assistant",
            content: assistantMessage.content ?? null,
            ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {})
          });

          emit({
            type: "tool.completed",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId: llmToolCallId,
            output: {
              model,
              round: round + 1,
              toolCallsRequested: toolCalls.length,
              characters: assistantText.length
            },
            createdAt: nowIso()
          });

          if (toolCalls.length === 0) {
            if (forcedRetryUsedCount < forceToolCallRetryCount) {
              forcedRetryUsedCount++;
              messages.push({
                role: "user",
                content: buildForceToolCallMessage(toolSchemas.map((t) => t.function.name))
              });
              continue;
            }
            completed = true;
            break;
          }

          for (const toolCall of toolCalls) {
            const toolName = toolCall.function.name.trim();
            const toolArgs = normalizeToolArguments(toolCall.function.arguments);
            const agentToolCallId = createId("tool");

            emit({
              type: "tool.called",
              threadId: input.threadId,
              runId: input.runId,
              toolCallId: agentToolCallId,
              toolName: toolName || "unknown.tool",
              input: toolArgs,
              createdAt: nowIso()
            });

            if (!toolName) {
              const errorMessage = "Assistant requested a tool call with no tool name.";
              emit({
                type: "tool.failed",
                threadId: input.threadId,
                runId: input.runId,
                toolCallId: agentToolCallId,
                error: errorMessage,
                createdAt: nowIso()
              });
              throw new Error(errorMessage);
            }

            const tool = toolsByName.get(toolName);
            if (!tool) {
              const errorMessage = `Assistant requested unknown tool: ${toolName}`;
              emit({
                type: "tool.failed",
                threadId: input.threadId,
                runId: input.runId,
                toolCallId: agentToolCallId,
                error: errorMessage,
                createdAt: nowIso()
              });
              throw new Error(errorMessage);
            }

            try {
              const toolOutput = await tool.execute(toolArgs, {
                threadId: input.threadId,
                runId: input.runId,
                model,
                toolName
              });

              emit({
                type: "tool.completed",
                threadId: input.threadId,
                runId: input.runId,
                toolCallId: agentToolCallId,
                output: toolOutput,
                createdAt: nowIso()
              });

              const outputContent = stringifyToolOutput(toolOutput);
              messages.push({ role: "tool", tool_call_id: toolCall.id, content: outputContent });

              emit({
                type: "message.created",
                threadId: input.threadId,
                messageId: createId("msg"),
                role: "tool",
                content: outputContent,
                runId: input.runId,
                createdAt: nowIso()
              });
            } catch (toolError) {
              const errorMessage =
                toolError instanceof Error ? toolError.message : "Unknown tool execution error";
              emit({
                type: "tool.failed",
                threadId: input.threadId,
                runId: input.runId,
                toolCallId: agentToolCallId,
                error: errorMessage,
                createdAt: nowIso()
              });
              throw toolError;
            }
          }
        }

        if (!completed) {
          throw new Error(`Agent loop hit the maximum number of tool rounds (${maxToolRounds}).`);
        }

        emit({
          type: "run.completed",
          threadId: input.threadId,
          runId: input.runId,
          createdAt: nowIso()
        });
      } else {
        const toolCallId = createId("tool");

        emit({
          type: "tool.called",
          threadId: input.threadId,
          runId: input.runId,
          toolCallId,
          toolName: "groq.chat",
          input: { model, userMessage: input.text },
          createdAt: nowIso()
        });

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: toOpenAIMessages(input, options.systemPrompt),
            stream: true
          })
        });

        if (!response.ok) {
          const details = await response.text();
          const errorMessage = `Groq request failed (${response.status}): ${details}`;
          emit({
            type: "tool.failed",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId,
            error: errorMessage,
            createdAt: nowIso()
          });
          throw new Error(errorMessage);
        }

        await parseSSEStream(response, (chunk) => {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            assistantText += delta;
            emit({
              type: "message.delta",
              threadId: input.threadId,
              messageId: assistantMessageId,
              runId: input.runId,
              delta,
              createdAt: nowIso()
            });
          }

          if (chunk.choices[0]?.finish_reason) {
            completed = true;
            emit({
              type: "tool.completed",
              threadId: input.threadId,
              runId: input.runId,
              toolCallId,
              output: {
                model,
                characters: assistantText.length,
                preview: assistantText.slice(0, 400)
              },
              createdAt: nowIso()
            });
            emit({
              type: "run.completed",
              threadId: input.threadId,
              runId: input.runId,
              createdAt: nowIso()
            });
          }
        });

        if (!completed) {
          emit({
            type: "tool.completed",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId,
            output: { model, characters: assistantText.length },
            createdAt: nowIso()
          });
          emit({
            type: "run.completed",
            threadId: input.threadId,
            runId: input.runId,
            createdAt: nowIso()
          });
        }
      }
    },

    async submitApproval(input, emit) {
      emit({
        type: "approval.resolved",
        threadId: input.threadId,
        runId: input.runId,
        approvalId: input.approvalId,
        decision: input.decision,
        createdAt: nowIso()
      });
    }
  };
}
