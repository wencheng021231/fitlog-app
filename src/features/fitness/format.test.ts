import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatDate, formatSet } from "./format.ts";

describe("fitness formatting", () => {
  it("formats dates deterministically without relying on Intl output", () => {
    const originalDateTimeFormat = Intl.DateTimeFormat;
    Intl.DateTimeFormat = function mockDateTimeFormat() {
      return {
        format: () => "6月15日 周一",
      } as Intl.DateTimeFormat;
    } as typeof Intl.DateTimeFormat;

    try {
      assert.equal(formatDate("2026-06-15"), "6月15日周一");
    } finally {
      Intl.DateTimeFormat = originalDateTimeFormat;
    }
  });

  it("formats workout sets with an explicit set number", () => {
    const formatted = formatSet({
      setNumber: 4,
      weightKg: 95,
      reps: 3,
      note: "最后一组",
      pre: 8.5,
      completed: true,
    });

    assert.equal(formatted, "第 4 组 · 完成 · 95kg × 3 reps · PRE 8.5 · 最后一组");
  });
});
