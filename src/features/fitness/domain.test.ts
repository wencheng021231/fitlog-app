import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addExerciseToDraft,
  addExerciseWithDefaultSets,
  addSetToDraftExercise,
  calculateExerciseProgress,
  completeDraftWorkout,
  createCustomExercise,
  createDraftFromPreviousWorkout,
  createCustomDraftWorkout,
  createDraftWorkout,
  createDraftWorkoutFromPlan,
  createPlanFromTrainingTemplate,
  getDashboardMetrics,
  getRecentExerciseTrainingRecords,
  getTodayPlan,
  snapshotWorkoutExerciseNames,
  updateCustomExercise,
  updateDraftSet,
} from "./domain.ts";
import type { Exercise, WorkoutPlan, WorkoutSession } from "./types.ts";

const plans: WorkoutPlan[] = [
  {
    id: "plan-push",
    name: "推力训练",
    focus: "胸肩三头",
    scheduledDays: [1, 3, 5],
    exercises: [
      { exerciseId: "bench", targetSets: 4, targetReps: 8, restSeconds: 90 },
    ],
  },
];

describe("fitness domain", () => {
  it("selects today's scheduled plan when weekday matches", () => {
    const monday = new Date("2026-06-15T09:00:00");

    const plan = getTodayPlan(plans, monday);

    assert.equal(plan?.id, "plan-push");
  });

  it("creates a draft workout from a plan and records multiple exercises with multiple sets", () => {
    const draft = createDraftWorkout(plans[0], "2026-06-15T10:00:00.000Z");
    const withBench = addSetToDraftExercise(draft, "bench", {
      weightKg: 80,
      reps: 8,
      note: "动作稳定",
      completed: true,
    });
    const withRow = addExerciseToDraft(withBench, "row");
    const completedDraft = addSetToDraftExercise(withRow, "row", {
      weightKg: 65,
      reps: 10,
      note: "最后两次吃力",
      completed: false,
    });

    assert.equal(completedDraft.entries.length, 2);
    assert.deepEqual(
      completedDraft.entries.map((entry) => entry.sets.length),
      [1, 1],
    );
    assert.equal(completedDraft.entries[0].sets[0].setNumber, 1);
    assert.equal(completedDraft.entries[1].sets[0].note, "最后两次吃力");
    assert.equal(completedDraft.entries[0].sets[0].completed, true);
    assert.equal(completedDraft.entries[1].sets[0].completed, false);
    assert.equal(completedDraft.totalSets, 1);
  });

  it("creates a custom workout draft with name, date, and selected exercises", () => {
    const draft = createCustomDraftWorkout({
      name: "胸肩三头",
      date: "2026-06-17",
      note: "今天主练胸部",
      exerciseIds: ["bench", "row"],
    });

    assert.equal(draft.planId, "custom");
    assert.equal(draft.planName, "胸肩三头");
    assert.equal(draft.date, "2026-06-17");
    assert.equal(draft.note, "今天主练胸部");
    assert.equal(draft.status, "draft");
    assert.deepEqual(
      draft.entries.map((entry) => entry.exerciseId),
      ["bench", "row"],
    );
  });

  it("adds an exercise with three default unfinished sets", () => {
    const draft = createCustomDraftWorkout({
      name: "背部训练",
      date: "2026-06-17",
      exerciseIds: [],
    });

    const nextDraft = addExerciseWithDefaultSets(draft, "row");

    assert.equal(nextDraft.entries.length, 1);
    assert.equal(nextDraft.entries[0].sets.length, 3);
    assert.deepEqual(
      nextDraft.entries[0].sets.map((set) => set.setNumber),
      [1, 2, 3],
    );
    assert.deepEqual(
      nextDraft.entries[0].sets.map((set) => set.completed),
      [false, false, false],
    );
  });

  it("creates an editable draft by copying the previous workout for today", () => {
    const previous: WorkoutSession = {
      id: "s1",
      planId: "custom",
      planName: "背部训练",
      note: "上次状态很好",
      date: "2026-06-15",
      startedAt: "2026-06-15T10:00:00.000Z",
      completedAt: "2026-06-15T11:00:00.000Z",
      status: "completed",
      totalSets: 2,
      totalVolumeKg: 1140,
      entries: [
        {
          exerciseId: "row",
          sets: [
            { setNumber: 1, weightKg: 60, reps: 10, note: "稳定", completed: true },
            { setNumber: 2, weightKg: 67.5, reps: 8, note: "吃力", completed: true },
          ],
        },
      ],
    };

    const draft = createDraftFromPreviousWorkout(previous, "2026-06-17");

    assert.equal(draft.planName, "背部训练");
    assert.equal(draft.date, "2026-06-17");
    assert.equal(draft.startedAt, "2026-06-17T00:00:00.000Z");
    assert.equal(draft.status, "draft");
    assert.equal(draft.completedAt, undefined);
    assert.equal(draft.note, "");
    assert.equal(draft.totalSets, 0);
    assert.equal(draft.totalVolumeKg, 0);
    assert.deepEqual(draft.entries, [
      {
        exerciseId: "row",
        sets: [
          { setNumber: 1, weightKg: 60, reps: 10, note: "", completed: false },
          { setNumber: 2, weightKg: 67.5, reps: 8, note: "", completed: false },
        ],
      },
    ]);
  });

  it("creates a plan from a training template with three default sets", () => {
    const plan = createPlanFromTrainingTemplate(
      {
        id: "template-push",
        name: "胸肩三头",
        focus: "胸、肩、三头",
        exercises: [
          { exerciseId: "bench", targetReps: 8 },
          { exerciseId: "press", targetReps: 10 },
        ],
      },
      "2026-06-17T09:00:00.000Z",
    );

    assert.equal(plan.name, "胸肩三头");
    assert.equal(plan.focus, "胸、肩、三头");
    assert.deepEqual(plan.scheduledDays, [3]);
    assert.deepEqual(plan.exercises, [
      { exerciseId: "bench", targetSets: 3, targetReps: 8, restSeconds: 90 },
      { exerciseId: "press", targetSets: 3, targetReps: 10, restSeconds: 90 },
    ]);
  });

  it("creates an editable workout draft from a plan with default sets and reps", () => {
    const draft = createDraftWorkoutFromPlan(plans[0], "2026-06-17");

    assert.equal(draft.planName, "推力训练");
    assert.equal(draft.date, "2026-06-17");
    assert.equal(draft.status, "draft");
    assert.equal(draft.entries[0].sets.length, 4);
    assert.deepEqual(
      draft.entries[0].sets.map((set) => ({
        weightKg: set.weightKg,
        reps: set.reps,
        completed: set.completed,
      })),
      [
        { weightKg: 0, reps: 8, completed: false },
        { weightKg: 0, reps: 8, completed: false },
        { weightKg: 0, reps: 8, completed: false },
        { weightKg: 0, reps: 8, completed: false },
      ],
    );
  });

  it("marks a completed workout with totals", () => {
    const draft = addSetToDraftExercise(createDraftWorkout(plans[0]), "bench", {
      weightKg: 82.5,
      reps: 6,
      note: "RPE 8",
      completed: true,
    });

    const completed = completeDraftWorkout(draft, "2026-06-15T11:00:00.000Z");

    assert.equal(completed.status, "completed");
    assert.equal(completed.completedAt, "2026-06-15T11:00:00.000Z");
    assert.equal(completed.totalSets, 1);
    assert.equal(completed.totalVolumeKg, 495);
  });

  it("records and updates a PRE value on a workout set", () => {
    const draft = addSetToDraftExercise(createDraftWorkout(plans[0]), "bench", {
      weightKg: 80,
      reps: 8,
      note: "",
      completed: true,
      pre: 7.5,
    });

    const updated = updateDraftSet(draft, "bench", 1, {
      weightKg: 82.5,
      reps: 6,
      note: "",
      completed: true,
      pre: 8,
    });

    assert.equal(draft.entries[0].sets[0].pre, 7.5);
    assert.equal(updated.entries[0].sets[0].pre, 8);
  });

  it("clears a PRE value when the workout set is updated without PRE", () => {
    const draft = addSetToDraftExercise(createDraftWorkout(plans[0]), "bench", {
      weightKg: 80,
      reps: 8,
      note: "",
      completed: true,
      pre: 7.5,
    });

    const updated = updateDraftSet(draft, "bench", 1, {
      weightKg: 80,
      reps: 8,
      note: "",
      completed: true,
    });
    const updatedSet = updated.entries[0].sets[0];

    assert.equal("pre" in updatedSet, false);
  });

  it("calculates per-session best weight progression for one exercise", () => {
    const sessions: WorkoutSession[] = [
      {
        id: "s1",
        planId: "plan-push",
        planName: "推力训练",
        date: "2026-06-10",
        startedAt: "2026-06-10T10:00:00.000Z",
        completedAt: "2026-06-10T11:00:00.000Z",
        status: "completed",
        totalSets: 2,
        totalVolumeKg: 1160,
        entries: [
          {
            exerciseId: "bench",
            sets: [
              { setNumber: 1, weightKg: 70, reps: 8, note: "", completed: true },
              { setNumber: 2, weightKg: 75, reps: 8, note: "", completed: true },
            ],
          },
        ],
      },
      {
        id: "s2",
        planId: "plan-push",
        planName: "推力训练",
        date: "2026-06-15",
        startedAt: "2026-06-15T10:00:00.000Z",
        completedAt: "2026-06-15T11:00:00.000Z",
        status: "completed",
        totalSets: 1,
        totalVolumeKg: 640,
        entries: [
          {
            exerciseId: "bench",
            sets: [
              { setNumber: 1, weightKg: 80, reps: 8, note: "", completed: true },
              { setNumber: 2, weightKg: 90, reps: 3, note: "", completed: false },
            ],
          },
        ],
      },
    ];

    const progress = calculateExerciseProgress(sessions, "bench");

    assert.deepEqual(progress, [
      { date: "2026-06-10", bestWeightKg: 75, bestVolumeKg: 600 },
      { date: "2026-06-15", bestWeightKg: 80, bestVolumeKg: 640 },
    ]);
  });

  it("lists the latest 10 records for an exercise with best weight and max volume", () => {
    const sessions: WorkoutSession[] = Array.from({ length: 11 }, (_, index) => {
      const day = `${index + 1}`.padStart(2, "0");
      const weight = 50 + index;

      return {
        id: `s${index + 1}`,
        planId: "custom",
        planName: "卧推训练",
        date: `2026-06-${day}`,
        startedAt: `2026-06-${day}T10:00:00.000Z`,
        completedAt: `2026-06-${day}T11:00:00.000Z`,
        status: "completed",
        totalSets: 3,
        totalVolumeKg: 0,
        entries: [
          {
            exerciseId: "bench",
            sets: [
              { setNumber: 1, weightKg: weight, reps: 8, note: "", completed: true },
              {
                setNumber: 2,
                weightKg: weight + 20,
                reps: 2,
                note: "未完成不计入",
                completed: false,
              },
              {
                setNumber: 3,
                weightKg: weight - 5,
                reps: 12,
                note: "",
                completed: true,
              },
            ],
          },
        ],
      };
    });

    const records = getRecentExerciseTrainingRecords(sessions, "bench");

    assert.equal(records.length, 10);
    assert.equal(records[0].date, "2026-06-11");
    assert.equal(records[0].planName, "卧推训练");
    assert.equal(records[0].bestWeightKg, 60);
    assert.equal(records[0].maxVolumeKg, 660);
    assert.equal(records.at(-1)?.date, "2026-06-02");
  });

  it("summarizes dashboard metrics for total, weekly count, and most trained exercise", () => {
    const sessions: WorkoutSession[] = [
      {
        id: "s1",
        planId: "custom",
        planName: "胸部训练",
        date: "2026-06-15",
        startedAt: "2026-06-15T10:00:00.000Z",
        completedAt: "2026-06-15T11:00:00.000Z",
        status: "completed",
        totalSets: 2,
        totalVolumeKg: 1160,
        entries: [
          {
            exerciseId: "bench",
            sets: [
              { setNumber: 1, weightKg: 70, reps: 8, note: "", completed: true },
              { setNumber: 2, weightKg: 75, reps: 8, note: "", completed: true },
            ],
          },
        ],
      },
      {
        id: "s2",
        planId: "custom",
        planName: "背部训练",
        date: "2026-06-17",
        startedAt: "2026-06-17T10:00:00.000Z",
        completedAt: "2026-06-17T11:00:00.000Z",
        status: "completed",
        totalSets: 3,
        totalVolumeKg: 1800,
        entries: [
          {
            exerciseId: "row",
            sets: [
              { setNumber: 1, weightKg: 60, reps: 10, note: "", completed: true },
              { setNumber: 2, weightKg: 60, reps: 10, note: "", completed: true },
            ],
          },
          {
            exerciseId: "bench",
            sets: [
              { setNumber: 1, weightKg: 80, reps: 6, note: "", completed: true },
            ],
          },
        ],
      },
      {
        id: "s3",
        planId: "custom",
        planName: "腿部训练",
        date: "2026-06-08",
        startedAt: "2026-06-08T10:00:00.000Z",
        completedAt: "2026-06-08T11:00:00.000Z",
        status: "completed",
        totalSets: 1,
        totalVolumeKg: 800,
        entries: [
          {
            exerciseId: "squat",
            sets: [
              { setNumber: 1, weightKg: 100, reps: 8, note: "", completed: true },
            ],
          },
        ],
      },
    ];

    const metrics = getDashboardMetrics(sessions, new Date("2026-06-17T12:00:00"));

    assert.equal(metrics.totalWorkoutCount, 3);
    assert.equal(metrics.weeklyWorkoutCount, 2);
    assert.equal(metrics.mostTrainedExerciseId, "bench");
  });

  it("creates and updates custom exercises while protecting built-in exercises", () => {
    const customExercise = createCustomExercise(
      {
        name: " 单臂绳索划船 ",
        category: "背",
        equipment: "绳索",
      },
      "2026-06-21T09:00:00.000Z",
    );

    assert.equal(customExercise.id, "custom-exercise-20260621090000000");
    assert.equal(customExercise.name, "单臂绳索划船");
    assert.equal(customExercise.category, "背");
    assert.equal(customExercise.equipment, "绳索");
    assert.equal(customExercise.source, "custom");
    assert.deepEqual(customExercise.targetMuscles, ["绳索"]);

    const updated = updateCustomExercise(customExercise, {
      name: "单臂高位划船",
      category: "背",
      equipment: "固定器械",
    });

    assert.equal(updated.name, "单臂高位划船");
    assert.equal(updated.category, "背");
    assert.equal(updated.equipment, "固定器械");
    assert.deepEqual(updated.targetMuscles, ["固定器械"]);

    const builtIn: Exercise = {
      id: "bench",
      name: "杠铃平板卧推",
      category: "胸部",
      targetMuscles: ["杠铃类"],
      source: "built-in",
    };

    assert.deepEqual(
      updateCustomExercise(builtIn, {
        name: "不能修改",
        category: "胸",
        equipment: "杠铃",
      }),
      builtIn,
    );
  });

  it("snapshots exercise names on completed sessions so deleted custom exercises do not break history", () => {
    const customExercise = createCustomExercise(
      {
        name: "自定义划船",
        category: "背",
        equipment: "哑铃",
      },
      "2026-06-21T10:00:00.000Z",
    );
    const draft = addSetToDraftExercise(
      createCustomDraftWorkout({
        name: "背部训练",
        date: "2026-06-21",
        exerciseIds: [customExercise.id],
      }),
      customExercise.id,
      {
        weightKg: 40,
        reps: 10,
        note: "",
        completed: true,
      },
    );

    const completed = completeDraftWorkout(draft, "2026-06-21T11:00:00.000Z");
    const snapshotted = snapshotWorkoutExerciseNames(completed, [customExercise]);
    const afterCatalogRename = snapshotWorkoutExerciseNames(snapshotted, [
      {
        ...customExercise,
        name: "新的动作名称",
      },
    ]);

    assert.equal(snapshotted.entries[0].exerciseName, "自定义划船");
    assert.equal(afterCatalogRename.entries[0].exerciseName, "自定义划船");
  });
});
