import type { AgentClient } from "@wafer/core";
import type { PropsWithChildren } from "react";
import { AgentContext } from "../context";

export interface AgentProviderProps extends PropsWithChildren {
  client: AgentClient;
}

export function AgentProvider({ client, children }: AgentProviderProps) {
  return <AgentContext.Provider value={client}>{children}</AgentContext.Provider>;
}
