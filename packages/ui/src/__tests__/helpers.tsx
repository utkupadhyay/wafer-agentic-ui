import type { AgentClient } from "@wafer/react";
import { AgentProvider, createAgentClient } from "@wafer/react";
import type { ReactNode } from "react";

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
