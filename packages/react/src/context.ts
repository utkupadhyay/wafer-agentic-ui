import type { AgentClient } from "@wafer/core";
import { createContext } from "react";

export const AgentContext = createContext<AgentClient | null>(null);
