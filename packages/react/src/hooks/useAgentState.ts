import { useSyncExternalStore } from "react";
import { useAgentClient } from "./useAgentClient";

export function useAgentState() {
  const client = useAgentClient();
  return useSyncExternalStore(client.subscribe.bind(client), client.getState.bind(client));
}
