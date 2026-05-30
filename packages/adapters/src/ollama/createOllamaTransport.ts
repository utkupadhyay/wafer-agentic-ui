import type { AgentTransport, SendUserMessageInput } from "@wafer/core";

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_name?: string;
  tool_calls?: OllamaToolCall[];
}

interface OllamaToolCall {
  type?: "function";
  function?: {
    index?: number;
    name?: string;
    description?: string;
    arguments?: unknown;
  };
}

interface OllamaChatResponse {
  message?: OllamaMessage;
  done?: boolean;
  error?: string;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaChunk {
  message?: OllamaMessage;
  done?: boolean;
  error?: string;
}

type OllamaThinkValue = boolean | "low" | "medium" | "high";

export interface CreateOllamaTransportOptions {
  model: string;
  baseUrl?: string;
  systemPrompt?: string;
  tools?: OllamaFunctionTool[];
  maxToolRounds?: number;
  think?: OllamaThinkValue;
  requestOptions?: Record<string, unknown>;
  forceToolCallRetryCount?: number;
}

export interface OllamaFunctionTool {
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

function toOllamaMessages(input: SendUserMessageInput, systemPrompt?: string) {
  const history = input.history
    .filter((message) => ["system", "user", "assistant"].includes(message.role))
    .map((message) => ({
      role: message.role as OllamaMessage["role"],
      content: message.content
    }));

  if (!systemPrompt) {
    return history;
  }

  return [{ role: "system", content: systemPrompt } as const, ...history];
}

async function parseStreamingBody(response: Response, onChunk: (chunk: OllamaChunk) => void) {
  if (!response.body) {
    const json = (await response.json()) as OllamaChunk;
    onChunk(json);
    return;
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }
      onChunk(JSON.parse(line) as OllamaChunk);
    }
  }

  const pending = buffer.trim();
  if (pending) {
    onChunk(JSON.parse(pending) as OllamaChunk);
  }
}

function normalizeToolArguments(raw: unknown) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return {};
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }

  return {};
}

function stringifyToolOutput(output: unknown) {
  if (typeof output === "string") {
    return output;
  }

  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
}

function toOllamaTools(tools: OllamaFunctionTool[]) {
  return tools.map((tool) => ({
    type: tool.type ?? "function",
    function: tool.function
  }));
}

async function parseJsonResponse(response: Response) {
  const json = (await response.json()) as OllamaChatResponse;
  return json;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toRecoveredToolCall(raw: unknown): OllamaToolCall | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (isRecord(raw.function) && typeof raw.function.name === "string") {
    return {
      type: typeof raw.type === "string" ? (raw.type as "function") : "function",
      function: {
        name: raw.function.name,
        arguments: raw.function.arguments
      }
    };
  }

  if (typeof raw.name === "string") {
    return {
      type: "function",
      function: {
        name: raw.name,
        arguments: raw.arguments
      }
    };
  }

  return null;
}

function extractJsonCandidates(text: string) {
  const candidates: string[] = [];
  const trimmed = text.trim();
  if (!trimmed) {
    return candidates;
  }

  const fencedPattern = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null = fencedPattern.exec(trimmed);
  while (match) {
    const fenced = match[1]?.trim();
    if (fenced) {
      candidates.push(fenced);
    }
    match = fencedPattern.exec(trimmed);
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(trimmed.slice(firstBracket, lastBracket + 1));
  }

  candidates.push(trimmed);
  return candidates;
}

function parseToolCallsFromContent(content: string): OllamaToolCall[] {
  const candidates = extractJsonCandidates(content);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;

      if (Array.isArray(parsed)) {
        const recovered = parsed
          .map((entry) => toRecoveredToolCall(entry))
          .filter((entry): entry is OllamaToolCall => entry !== null);
        if (recovered.length > 0) {
          return recovered;
        }
        continue;
      }

      if (!isRecord(parsed)) {
        continue;
      }

      if (Array.isArray(parsed.tool_calls)) {
        const recovered = parsed.tool_calls
          .map((entry) => toRecoveredToolCall(entry))
          .filter((entry): entry is OllamaToolCall => entry !== null);
        if (recovered.length > 0) {
          return recovered;
        }
      }

      const single = toRecoveredToolCall(parsed);
      if (single) {
        return [single];
      }
    } catch {
      // Try next candidate.
    }
  }

  return [];
}

function buildForceToolCallMessage(toolNames: string[]) {
  return [
    "Tool use required for this turn.",
    "You must call at least one tool before your final assistant response.",
    `Available tools: ${toolNames.join(", ")}.`,
    "If the user provided onboarding details in natural language, use set_onboarding_fields with every field you can infer."
  ].join(" ");
}

export function createOllamaTransport(options: CreateOllamaTransportOptions): AgentTransport {
  const baseUrl = options.baseUrl ?? "http://localhost:11434";
  const configuredTools = options.tools ?? [];
  const maxToolRounds = Math.max(1, options.maxToolRounds ?? 6);
  const forceToolCallRetryCount = Math.max(0, options.forceToolCallRetryCount ?? 0);
  const think: OllamaThinkValue | undefined =
    options.think ?? (options.model.includes("gpt-oss") ? "low" : undefined);
  const requestOptions = options.requestOptions;
  const ollamaToolSchemas = toOllamaTools(configuredTools);
  const toolsByName = new Map(configuredTools.map((tool) => [tool.function.name, tool]));

  // Persisted across calls so tool messages and assistant tool_calls survive multi-turn.
  let persistedMessages: OllamaMessage[] | null = null;

  return {
    async sendUserMessage(input, emit) {
      const assistantMessageId = createId("msg");
      let completed = false;
      let assistantText = "";

      emit({
        type: "message.created",
        threadId: input.threadId,
        messageId: assistantMessageId,
        role: "assistant",
        runId: input.runId,
        content: "",
        createdAt: nowIso()
      });

      if (ollamaToolSchemas.length > 0) {
        if (persistedMessages === null) {
          persistedMessages = toOllamaMessages(input, options.systemPrompt) as OllamaMessage[];
        } else {
          persistedMessages.push({ role: "user", content: input.text });
        }
        const messages = persistedMessages;
        let forcedRetryUsedCount = 0;

        for (let round = 0; round < maxToolRounds; round += 1) {
          const llmToolCallId = createId("tool");
          let llmToolFinalized = false;

          emit({
            type: "tool.called",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId: llmToolCallId,
            toolName: "ollama.chat",
            input: {
              model: options.model,
              round: round + 1,
              userMessage: input.text,
              toolsEnabled: ollamaToolSchemas.map((tool) => tool.function.name)
            },
            createdAt: nowIso()
          });

          const response = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: options.model,
              stream: false,
              messages,
              tools: ollamaToolSchemas,
              ...(requestOptions ? { options: requestOptions } : {}),
              ...(think !== undefined ? { think } : {})
            })
          });

          if (!response.ok) {
            const details = await response.text();
            const errorMessage = `Ollama request failed (${response.status}): ${details}`;
            emit({
              type: "tool.failed",
              threadId: input.threadId,
              runId: input.runId,
              toolCallId: llmToolCallId,
              error: errorMessage,
              createdAt: nowIso()
            });
            llmToolFinalized = true;
            throw new Error(errorMessage);
          }

          const body = await parseJsonResponse(response);
          const error = body.error;
          if (error) {
            emit({
              type: "tool.failed",
              threadId: input.threadId,
              runId: input.runId,
              toolCallId: llmToolCallId,
              error,
              createdAt: nowIso()
            });
            llmToolFinalized = true;
            throw new Error(error);
          }

          const assistantMessage = body.message ?? {
            role: "assistant" as const,
            content: ""
          };
          const declaredToolCalls = assistantMessage.tool_calls ?? [];
          const recoveredToolCalls =
            declaredToolCalls.length === 0 && assistantMessage.content
              ? parseToolCallsFromContent(assistantMessage.content)
              : [];
          const toolCalls = declaredToolCalls.length > 0 ? declaredToolCalls : recoveredToolCalls;

          const assistantDelta = assistantMessage.content ?? "";
          const shouldEmitAssistantText = !(
            declaredToolCalls.length === 0 && recoveredToolCalls.length > 0
          );
          if (assistantDelta && shouldEmitAssistantText) {
            assistantText += assistantDelta;
            emit({
              type: "message.delta",
              threadId: input.threadId,
              messageId: assistantMessageId,
              runId: input.runId,
              delta: assistantDelta,
              createdAt: nowIso()
            });
          }

          messages.push({
            role: "assistant",
            content: assistantMessage.content ?? "",
            tool_calls: toolCalls
          });

          emit({
            type: "tool.completed",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId: llmToolCallId,
            output: {
              model: options.model,
              round: round + 1,
              toolCallsRequested: toolCalls.length,
              recoveredToolCalls: recoveredToolCalls.length,
              characters: assistantText.length,
              preview: assistantText.slice(0, 400),
              promptEvalCount: body.prompt_eval_count,
              evalCount: body.eval_count
            },
            createdAt: nowIso()
          });
          llmToolFinalized = true;

          if (toolCalls.length === 0) {
            if (forcedRetryUsedCount < forceToolCallRetryCount) {
              forcedRetryUsedCount += 1;
              messages.push({
                role: "user",
                content: buildForceToolCallMessage(
                  ollamaToolSchemas.map((tool) => tool.function.name)
                )
              });
              continue;
            }
            completed = true;
            break;
          }

          for (const requestedToolCall of toolCalls) {
            const toolName = requestedToolCall.function?.name?.trim() ?? "";
            const toolArgs = normalizeToolArguments(requestedToolCall.function?.arguments);
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
                model: options.model,
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

              const toolOutputContent = stringifyToolOutput(toolOutput);
              messages.push({
                role: "tool",
                tool_name: toolName,
                content: toolOutputContent
              });

              emit({
                type: "message.created",
                threadId: input.threadId,
                messageId: createId("msg"),
                role: "tool",
                content: toolOutputContent,
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

          if (!llmToolFinalized) {
            emit({
              type: "tool.completed",
              threadId: input.threadId,
              runId: input.runId,
              toolCallId: llmToolCallId,
              output: {
                model: options.model,
                round: round + 1,
                characters: assistantText.length,
                preview: assistantText.slice(0, 400)
              },
              createdAt: nowIso()
            });
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
        let toolFinalized = false;

        emit({
          type: "tool.called",
          threadId: input.threadId,
          runId: input.runId,
          toolCallId,
          toolName: "ollama.chat",
          input: {
            model: options.model,
            userMessage: input.text
          },
          createdAt: nowIso()
        });

        const response = await fetch(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: options.model,
            stream: true,
            messages: toOllamaMessages(input, options.systemPrompt),
            ...(requestOptions ? { options: requestOptions } : {}),
            ...(think !== undefined ? { think } : {})
          })
        });

        if (!response.ok) {
          const details = await response.text();
          const errorMessage = `Ollama request failed (${response.status}): ${details}`;

          emit({
            type: "tool.failed",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId,
            error: errorMessage,
            createdAt: nowIso()
          });
          toolFinalized = true;
          throw new Error(errorMessage);
        }

        await parseStreamingBody(response, (chunk) => {
          if (chunk.error) {
            if (!toolFinalized) {
              emit({
                type: "tool.failed",
                threadId: input.threadId,
                runId: input.runId,
                toolCallId,
                error: chunk.error,
                createdAt: nowIso()
              });
              toolFinalized = true;
            }
            throw new Error(chunk.error);
          }

          const delta = chunk.message?.content;
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

          if (chunk.done) {
            completed = true;

            if (!toolFinalized) {
              emit({
                type: "tool.completed",
                threadId: input.threadId,
                runId: input.runId,
                toolCallId,
                output: {
                  model: options.model,
                  characters: assistantText.length,
                  preview: assistantText.slice(0, 400)
                },
                createdAt: nowIso()
              });
              toolFinalized = true;
            }

            emit({
              type: "run.completed",
              threadId: input.threadId,
              runId: input.runId,
              createdAt: nowIso()
            });
          }
        });

        if (!toolFinalized) {
          emit({
            type: "tool.completed",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId,
            output: {
              model: options.model,
              characters: assistantText.length,
              preview: assistantText.slice(0, 400)
            },
            createdAt: nowIso()
          });
          toolFinalized = true;
        }

        if (!completed) {
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
