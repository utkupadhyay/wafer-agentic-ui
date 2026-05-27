import type { ReactNode } from "react";
import { statusBadgeClass } from "./theme";

interface StatusBadgeProps {
  status: "idle" | "running" | "error";
  children?: ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return <span className={statusBadgeClass(status)}>{children ?? status}</span>;
}
