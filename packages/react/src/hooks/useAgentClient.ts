import { useContext } from "react";
import { AgentContext } from "../context";

export function useAgentClient() {
  const client = useContext(AgentContext);

  if (!client) {
    throw new Error("useAgentClient must be used inside <AgentProvider />.");
  }

  return client;
}
