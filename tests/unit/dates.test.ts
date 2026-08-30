import { describe, expect, it } from "vitest";
import { parseNigeriaDateInput } from "@/lib/dates/nigeria";

describe("Nigeria date input parsing", () => {
  it("treats a date-only input as midnight in Africa/Lagos", () => {
    expect(parseNigeriaDateInput("2026-08-30").toISOString()).toBe("2026-08-29T23:00:00.000Z");
  });

  it("accepts an explicit ISO datetime", () => {
    expect(parseNigeriaDateInput("2026-08-30T10:00:00+01:00").toISOString()).toBe("2026-08-30T09:00:00.000Z");
  });

  it("rejects invalid input", () => {
    expect(() => parseNigeriaDateInput("not-a-date")).toThrow("Invalid date");
  });
});
