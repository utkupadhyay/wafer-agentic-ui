import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "../components/StatusBadge";

describe("StatusBadge", () => {
  it("renders the status text by default", () => {
    render(<StatusBadge status="idle" />);
    expect(screen.getByText("idle")).toBeInTheDocument();
  });

  it("renders custom children when provided", () => {
    render(<StatusBadge status="running">In Progress</StatusBadge>);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders error status text", () => {
    render(<StatusBadge status="error" />);
    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("applies a CSS class to the span", () => {
    const { container } = render(<StatusBadge status="idle" />);
    const span = container.querySelector("span");
    expect(span?.className).toBeTruthy();
  });
});
