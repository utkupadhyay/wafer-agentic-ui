import type { AgentEvent, MessageRole } from "@wafer/protocol";
import { createInitialState } from "../state";
import { reduceEvent } from "../runtime/reduceEvent";
import type { AgentState, AgentTransport, SubmitApprovalInput } from "../types";

type Listener = () => void;

export interface CreateAgentClientOptions {
  transport: AgentTransport;
  threadId?: string;
}

function createId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${id}`;
}

function nowIso() {
  return new Date().toISOString();
}

export class AgentClient {
  private state: AgentState;
  private readonly transport: AgentTransport;
  private readonly listeners = new Set<Listener>();

  constructor(options: CreateAgentClientOptions) {
    this.transport = options.transport;
    this.state = createInitialState(options.threadId ?? createId("thread"));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private push(event: AgentEvent) {
    this.state = reduceEvent(this.state, event);
    this.notify();
  }

  private toHistory() {
    return this.state.messages.map((message) => ({
      role: message.role as MessageRole,
      content: message.content
    }));
  }

  async sendUserMessage(text: string) {
    const runId = createId("run");
    const userMessageId = createId("msg");

    this.push({
      type: "run.started",
      threadId: this.state.threadId,
      runId,
      createdAt: nowIso()
    });

    this.push({
      type: "message.created",
      threadId: this.state.threadId,
      messageId: userMessageId,
      role: "user",
      content: text,
      runId,
      createdAt: nowIso()
    });

    const history = this.toHistory();

    try {
      await this.transport.sendUserMessage(
        {
          threadId: this.state.threadId,
          runId,
          messageId: userMessageId,
          text,
          history
        },
        (event) => this.push(event)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      this.push({
        type: "run.failed",
        threadId: this.state.threadId,
        runId,
        error: message,
        createdAt: nowIso()
      });
      this.push({
        type: "error",
        threadId: this.state.threadId,
        error: message,
        createdAt: nowIso()
      });
    }
  }

  async resolveApproval(
    approvalId: string,
    runId: string,
    decision: SubmitApprovalInput["decision"]
  ) {
    if (!this.transport.submitApproval) {
      throw new Error("This transport does not support approvals yet.");
    }

    const payload: SubmitApprovalInput = {
      threadId: this.state.threadId,
      runId,
      approvalId,
      decision,
      history: this.toHistory()
    };

    await this.transport.submitApproval(payload, (event) => this.push(event));
  }
}

export function createAgentClient(options: CreateAgentClientOptions) {
  return new AgentClient(options);
}
