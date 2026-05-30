import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Composer } from "../components/Composer";
import { makeClient, makeWrapper } from "./helpers";

describe("Composer", () => {
  it("renders the label", () => {
    const client = makeClient();
    render(<Composer label="Your question" />, { wrapper: makeWrapper(client) });
    expect(screen.getByText("Your question")).toBeInTheDocument();
  });

  it("renders the placeholder on the textarea", () => {
    const client = makeClient();
    render(<Composer placeholder="Type here..." />, { wrapper: makeWrapper(client) });
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  it("shows Send button by default", () => {
    const client = makeClient();
    render(<Composer />, { wrapper: makeWrapper(client) });
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("shows Prefilling... when isPrefilling is true", () => {
    const client = makeClient();
    render(<Composer isPrefilling />, { wrapper: makeWrapper(client) });
    expect(screen.getByRole("button", { name: /prefilling/i })).toBeInTheDocument();
  });

  it("disables the button when isPrefilling is true", () => {
    const client = makeClient();
    render(<Composer isPrefilling />, { wrapper: makeWrapper(client) });
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("typing updates the textarea value", async () => {
    const user = userEvent.setup();
    const client = makeClient();
    render(<Composer />, { wrapper: makeWrapper(client) });

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "hello");
    expect(textarea).toHaveValue("hello");
  });

  it("submitting calls onPromptSubmitted with the typed text", async () => {
    const user = userEvent.setup();
    const onPromptSubmitted = vi.fn().mockResolvedValue(undefined);
    const client = makeClient();
    render(<Composer onPromptSubmitted={onPromptSubmitted} />, { wrapper: makeWrapper(client) });

    await user.type(screen.getByRole("textbox"), "test query");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(onPromptSubmitted).toHaveBeenCalledWith("test query");
  });

  it("does not submit when textarea is empty", async () => {
    const user = userEvent.setup();
    const onPromptSubmitted = vi.fn();
    const client = makeClient();
    render(<Composer onPromptSubmitted={onPromptSubmitted} />, { wrapper: makeWrapper(client) });

    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(onPromptSubmitted).not.toHaveBeenCalled();
  });

  it("clears textarea after submit", async () => {
    const user = userEvent.setup();
    const client = makeClient();
    render(<Composer />, { wrapper: makeWrapper(client) });

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "hello");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(textarea).toHaveValue("");
  });
});
