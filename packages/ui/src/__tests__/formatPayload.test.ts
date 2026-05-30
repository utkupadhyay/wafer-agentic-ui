import { describe, expect, it } from "vitest";
import { formatPayload } from "../utils/formatPayload";

describe("formatPayload", () => {
  it("returns 'No data' for undefined", () => {
    expect(formatPayload(undefined)).toBe("No data");
  });

  it("returns the string as-is for string values", () => {
    expect(formatPayload("hello world")).toBe("hello world");
  });

  it("returns empty string as-is", () => {
    expect(formatPayload("")).toBe("");
  });

  it("JSON.stringifies plain objects with 2-space indent", () => {
    expect(formatPayload({ a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it("JSON.stringifies arrays", () => {
    expect(formatPayload([1, 2, 3])).toBe(JSON.stringify([1, 2, 3], null, 2));
  });

  it("JSON.stringifies nested objects", () => {
    const val = { x: { y: [1, 2] } };
    expect(formatPayload(val)).toBe(JSON.stringify(val, null, 2));
  });

  it("JSON.stringifies null as 'null'", () => {
    expect(formatPayload(null)).toBe("null");
  });

  it("JSON.stringifies numbers", () => {
    expect(formatPayload(42)).toBe("42");
  });

  it("JSON.stringifies booleans", () => {
    expect(formatPayload(true)).toBe("true");
    expect(formatPayload(false)).toBe("false");
  });
});
