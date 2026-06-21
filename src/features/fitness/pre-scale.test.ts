import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getPreSliderPercent, preScaleValues } from "./pre-scale.ts";

describe("PRE scale", () => {
  it("creates PRE values from 0.5 to 10.0 in half-point steps", () => {
    assert.equal(preScaleValues.length, 20);
    assert.equal(preScaleValues[0], 0.5);
    assert.equal(preScaleValues.at(-1), 10);
    assert.deepEqual(preScaleValues.slice(8, 11), [4.5, 5, 5.5]);
  });

  it("maps PRE values to slider fill percentages", () => {
    assert.equal(getPreSliderPercent(0.5), 0);
    assert.equal(getPreSliderPercent(10), 100);
    assert.equal(getPreSliderPercent(5), 47.37);
  });
});
