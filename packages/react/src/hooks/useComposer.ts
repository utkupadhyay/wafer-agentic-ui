import { useCallback, useState } from "react";
import { useAgentClient } from "./useAgentClient";
import { useAgentState } from "./useAgentState";

export function useComposer() {
  const client = useAgentClient();
  const state = useAgentState();
  const [input, setInput] = useState("");

  const submit = useCallback(
    async (value?: string) => {
      const message = (value ?? input).trim();
      if (!message) {
        return;
      }
      await client.sendUserMessage(message);
      setInput("");
    },
    [client, input]
  );

  return {
    input,
    setInput,
    submit,
    isRunning: state.status === "running"
  };
}
