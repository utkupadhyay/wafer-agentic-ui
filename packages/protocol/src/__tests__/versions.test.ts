import { describe, expect, it } from "vitest";
import { PROTOCOL_NAME, PROTOCOL_VERSION } from "../versions";

describe("protocol versions", () => {
  it("exports PROTOCOL_NAME", () => {
    expect(PROTOCOL_NAME).toBe("wafer-agentic-event-protocol");
  });

  it("exports PROTOCOL_VERSION", () => {
    expect(PROTOCOL_VERSION).toBe("0.1.0");
  });

  it("PROTOCOL_VERSION follows semver format", () => {
    expect(PROTOCOL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
