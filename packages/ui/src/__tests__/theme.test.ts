import { describe, expect, it } from "vitest";
import {
  buttonGhostClass,
  cardLabelClass,
  codeBlockClass,
  messageCardClass,
  panelClass,
  sectionTitleClass,
  stateChipClass,
  statusBadgeClass,
  toolCallCardClass
} from "../components/theme";

describe("theme constants", () => {
  it("panelClass is a non-empty string", () => {
    expect(typeof panelClass).toBe("string");
    expect(panelClass.length).toBeGreaterThan(0);
  });

  it("sectionTitleClass is a non-empty string", () => {
    expect(typeof sectionTitleClass).toBe("string");
    expect(sectionTitleClass.length).toBeGreaterThan(0);
  });

  it("cardLabelClass is a non-empty string", () => {
    expect(typeof cardLabelClass).toBe("string");
    expect(cardLabelClass.length).toBeGreaterThan(0);
  });

  it("codeBlockClass is a non-empty string", () => {
    expect(typeof codeBlockClass).toBe("string");
    expect(codeBlockClass.length).toBeGreaterThan(0);
  });

  it("buttonGhostClass is a non-empty string", () => {
    expect(typeof buttonGhostClass).toBe("string");
    expect(buttonGhostClass.length).toBeGreaterThan(0);
  });
});

describe("statusBadgeClass", () => {
  it("returns a string for idle", () => {
    expect(typeof statusBadgeClass("idle")).toBe("string");
  });

  it("returns a string for running", () => {
    expect(typeof statusBadgeClass("running")).toBe("string");
  });

  it("returns a string for error", () => {
    expect(typeof statusBadgeClass("error")).toBe("string");
  });

  it("returns different classes for different statuses", () => {
    expect(statusBadgeClass("idle")).not.toBe(statusBadgeClass("running"));
    expect(statusBadgeClass("running")).not.toBe(statusBadgeClass("error"));
  });

  it("includes amber classes for running status", () => {
    expect(statusBadgeClass("running")).toContain("amber");
  });

  it("includes rose classes for error status", () => {
    expect(statusBadgeClass("error")).toContain("rose");
  });
});

describe("stateChipClass", () => {
  const statuses = ["running", "completed", "failed", "pending", "approved", "rejected"] as const;

  for (const status of statuses) {
    it(`returns a string for ${status}`, () => {
      expect(typeof stateChipClass(status)).toBe("string");
      expect(stateChipClass(status).length).toBeGreaterThan(0);
    });
  }

  it("returns different values for running vs completed", () => {
    expect(stateChipClass("running")).not.toBe(stateChipClass("completed"));
  });
});

describe("messageCardClass", () => {
  const roles = ["user", "assistant", "system", "tool"] as const;

  for (const role of roles) {
    it(`returns a string for role ${role}`, () => {
      expect(typeof messageCardClass(role)).toBe("string");
      expect(messageCardClass(role).length).toBeGreaterThan(0);
    });
  }

  it("returns different classes for user vs assistant", () => {
    expect(messageCardClass("user")).not.toBe(messageCardClass("assistant"));
  });

  it("includes blue classes for user role", () => {
    expect(messageCardClass("user")).toContain("blue");
  });

  it("includes violet classes for assistant role", () => {
    expect(messageCardClass("assistant")).toContain("violet");
  });
});

describe("toolCallCardClass", () => {
  it("returns a string for running", () => {
    expect(typeof toolCallCardClass("running")).toBe("string");
  });

  it("returns a string for completed", () => {
    expect(typeof toolCallCardClass("completed")).toBe("string");
  });

  it("returns a string for failed", () => {
    expect(typeof toolCallCardClass("failed")).toBe("string");
  });

  it("returns different classes for running vs completed", () => {
    expect(toolCallCardClass("running")).not.toBe(toolCallCardClass("completed"));
  });

  it("includes emerald border for completed", () => {
    expect(toolCallCardClass("completed")).toContain("emerald");
  });

  it("includes rose border for failed", () => {
    expect(toolCallCardClass("failed")).toContain("rose");
  });
});
