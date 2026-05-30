import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AgentProvider } from "../provider/AgentProvider";
import { makeClient } from "./helpers";

describe("AgentProvider", () => {
  it("renders children", () => {
    const client = makeClient();
    render(
      <AgentProvider client={client}>
        <span>hello world</span>
      </AgentProvider>
    );
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    const client = makeClient();
    render(
      <AgentProvider client={client}>
        <span>first</span>
        <span>second</span>
      </AgentProvider>
    );
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });
});
