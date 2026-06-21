import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createBackupFileName,
  createClearedFitnessState,
  importFitnessBackup,
  serializeFitnessState,
  type ExportableFitnessState,
} from "./storage-helpers.ts";

describe("fitness storage helpers", () => {
  it("creates a cleared local state while keeping built-in exercises", () => {
    const state = createClearedFitnessState([
      {
        id: "bench",
        name: "杠铃卧推",
        category: "胸部",
        targetMuscles: ["杠铃类"],
      },
    ]);

    assert.ok(state.exercises.length > 0);
    assert.deepEqual(state.plans, []);
    assert.deepEqual(state.sessions, []);
  });

  it("serializes fitness state for data export", () => {
    const state: ExportableFitnessState = {
      exercises: [
        {
          id: "bench",
          name: "杠铃卧推",
          category: "胸部",
          equipment: "杠铃",
          source: "custom",
          targetMuscles: ["杠铃类"],
        },
      ],
      plans: [],
      sessions: [],
    };

    const exported = serializeFitnessState(state);
    const parsed = JSON.parse(exported);

    assert.equal(parsed.app, "练！Fit");
    assert.equal(parsed.version, 1);
    assert.equal(parsed.data.exercises[0].name, "杠铃卧推");
    assert.match(exported, /\n  "data"/);
  });

  it("creates a dated backup file name", () => {
    assert.equal(
      createBackupFileName(new Date("2026-06-21T09:00:00.000Z")),
      "fitlog-backup-2026-06-21.json",
    );
  });

  it("merges imported backup data without overwriting existing records", () => {
    const current: ExportableFitnessState = {
      exercises: [
        {
          id: "builtin-bench",
          name: "杠铃卧推",
          category: "胸部",
          source: "built-in",
          targetMuscles: ["杠铃"],
        },
        {
          id: "custom-row",
          name: "当前划船",
          category: "背部",
          equipment: "哑铃",
          source: "custom",
          targetMuscles: ["哑铃"],
        },
      ],
      plans: [],
      sessions: [
        {
          id: "session-current",
          planId: "custom",
          planName: "当前训练",
          date: "2026-06-20",
          startedAt: "2026-06-20T00:00:00.000Z",
          completedAt: "2026-06-20T01:00:00.000Z",
          status: "completed",
          totalSets: 0,
          totalVolumeKg: 0,
          entries: [],
        },
      ],
    };
    const backup = JSON.stringify({
      version: 1,
      data: {
        exercises: [
          {
            id: "custom-row",
            name: "备份划船",
            category: "背部",
            equipment: "绳索",
            source: "custom",
            targetMuscles: ["绳索"],
          },
          {
            id: "custom-curl",
            name: "自定义弯举",
            category: "手臂",
            equipment: "哑铃",
            source: "custom",
            targetMuscles: ["哑铃"],
          },
        ],
        plans: [],
        sessions: [
          {
            id: "session-current",
            planId: "custom",
            planName: "备份重复训练",
            date: "2026-06-19",
            startedAt: "2026-06-19T00:00:00.000Z",
            status: "completed",
            totalSets: 0,
            totalVolumeKg: 0,
            entries: [],
          },
          {
            id: "session-imported",
            planId: "custom",
            planName: "导入训练",
            date: "2026-06-21",
            startedAt: "2026-06-21T00:00:00.000Z",
            status: "completed",
            totalSets: 0,
            totalVolumeKg: 0,
            entries: [],
          },
        ],
      },
    });

    const result = importFitnessBackup(current, backup);

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(
      result.state.exercises.find((exercise) => exercise.id === "custom-row")?.name,
      "当前划船",
    );
    assert.equal(
      result.state.exercises.some((exercise) => exercise.id === "custom-curl"),
      true,
    );
    assert.equal(
      result.state.sessions.find((session) => session.id === "session-current")
        ?.planName,
      "当前训练",
    );
    assert.equal(
      result.state.sessions.some((session) => session.id === "session-imported"),
      true,
    );
    assert.deepEqual(result.summary, {
      exercises: 1,
      plans: 0,
      sessions: 1,
    });
  });

  it("returns a friendly error for invalid backup JSON", () => {
    const result = importFitnessBackup(
      {
        exercises: [],
        plans: [],
        sessions: [],
      },
      "{ bad json",
    );

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }

    assert.match(result.message, /无法读取/);
  });
});
