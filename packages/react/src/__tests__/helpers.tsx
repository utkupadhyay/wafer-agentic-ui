import type { AgentClient } from "@wafer/core";
import { createAgentClient } from "@wafer/core";
import type { ReactNode } from "react";
import { AgentProvider } from "../provider/AgentProvider";

export function makeMockTransport() {
  return { sendUserMessage: async () => {} };
}

export function makeClient(threadId?: string): AgentClient {
  return createAgentClient({ transport: makeMockTransport(), threadId });
}

export function makeWrapper(client: AgentClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AgentProvider client={client}>{children}</AgentProvider>;
  };
}
