import type { AgentTransport, SendUserMessageInput } from "@wafer/core";

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

interface OllamaChunk {
  message?: OllamaMessage;
  done?: boolean;
  error?: string;
}

export interface CreateOllamaTransportOptions {
  model: string;
  baseUrl?: string;
  systemPrompt?: string;
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
    .filter((message) =>
      ["system", "user", "assistant", "tool"].includes(message.role)
    )
    .map((message) => ({
      role: message.role as OllamaMessage["role"],
      content: message.content
    }));

  if (!systemPrompt) {
    return history;
  }

  return [{ role: "system", content: systemPrompt } as const, ...history];
}

async function parseStreamingBody(
  response: Response,
  onChunk: (chunk: OllamaChunk) => void
) {
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

export function createOllamaTransport(
  options: CreateOllamaTransportOptions
): AgentTransport {
  const baseUrl = options.baseUrl ?? "http://localhost:11434";

  return {
    async sendUserMessage(input, emit) {
      const assistantMessageId = createId("msg");
      const toolCallId = createId("tool");
      let completed = false;
      let toolFinalized = false;
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

      try {
        const response = await fetch(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: options.model,
            stream: true,
            messages: toOllamaMessages(input, options.systemPrompt)
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
      } catch (error) {
        if (!toolFinalized) {
          const message = error instanceof Error ? error.message : "Unknown error";
          emit({
            type: "tool.failed",
            threadId: input.threadId,
            runId: input.runId,
            toolCallId,
            error: message,
            createdAt: nowIso()
          });
        }
        throw error;
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
