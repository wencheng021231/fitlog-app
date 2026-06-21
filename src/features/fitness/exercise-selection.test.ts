import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getExerciseSelectionGroups } from "./exercise-selection.ts";
import type { Exercise } from "./types.ts";

describe("exercise selection", () => {
  it("groups exercises into the workout picker category order", () => {
    const exercises: Exercise[] = [
      {
        id: "bench",
        name: "杠铃平板卧推",
        category: "胸部",
        targetMuscles: ["杠铃类"],
      },
      {
        id: "press",
        name: "哑铃坐姿推举",
        category: "肩部",
        targetMuscles: ["推举类"],
      },
      {
        id: "squat",
        name: "杠铃深蹲",
        category: "腿部",
        targetMuscles: ["股四头肌"],
      },
      {
        id: "row",
        name: "杠铃俯身划船",
        category: "背部",
        targetMuscles: ["水平拉类"],
      },
      {
        id: "crunch",
        name: "卷腹",
        category: "腹部",
        targetMuscles: ["上腹部"],
      },
      {
        id: "push-up",
        name: "标准俯卧撑",
        category: "胸部",
        targetMuscles: ["自重类"],
      },
    ];

    const groups = getExerciseSelectionGroups(exercises);

    assert.deepEqual(
      groups.map((group) => group.category),
      ["胸部", "肩部", "腿部", "背部", "腹部", "自重"],
    );
    assert.deepEqual(
      groups.map((group) => group.exercises.map((exercise) => exercise.id)),
      [["bench"], ["press"], ["squat"], ["row"], ["crunch"], ["push-up"]],
    );
  });
});
