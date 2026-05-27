import { createContext } from "react";
import type { AgentClient } from "@wafer/core";

export const AgentContext = createContext<AgentClient | null>(null);
