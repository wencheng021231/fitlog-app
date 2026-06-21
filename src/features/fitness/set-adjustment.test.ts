import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { adjustWorkoutSetValue } from "./set-adjustment.ts";

describe("workout set adjustment", () => {
  it("adjusts weight by 5kg steps without going below zero", () => {
    assert.equal(adjustWorkoutSetValue(20, 5), 25);
    assert.equal(adjustWorkoutSetValue(20, -5), 15);
    assert.equal(adjustWorkoutSetValue(2.5, -5), 0);
  });

  it("adjusts reps by one-rep steps without going below zero", () => {
    assert.equal(adjustWorkoutSetValue(8, 1), 9);
    assert.equal(adjustWorkoutSetValue(8, -1), 7);
    assert.equal(adjustWorkoutSetValue(0, -1), 0);
  });
});
