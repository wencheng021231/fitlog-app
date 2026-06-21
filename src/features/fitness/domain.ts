import type {
  DashboardMetrics,
  Exercise,
  ExerciseProgressPoint,
  ExerciseTrainingRecord,
  PlannedExercise,
  TrainingTemplate,
  WorkoutPlan,
  WorkoutSession,
  WorkoutSet,
} from "./types";

type SetInput = Omit<WorkoutSet, "setNumber">;
type CustomExerciseInput = {
  name: string;
  category: string;
  equipment: string;
};

const toDateKey = (isoDate: string) => isoDate.slice(0, 10);

const createId = (prefix: string, value: string) =>
  `${prefix}-${value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}`;

const createTimestampId = (prefix: string, value: string) =>
  `${prefix}-${value.replace(/\D/g, "").slice(0, 17)}`;

const normalizeCustomExerciseInput = (input: CustomExerciseInput) => {
  const name = input.name.trim() || "未命名动作";
  const category = input.category.trim() || "其他";
  const equipment = input.equipment.trim() || "其他";

  return { name, category, equipment };
};

export function isCustomExercise(exercise: Exercise) {
  return exercise.source === "custom";
}

export function createCustomExercise(
  input: CustomExerciseInput,
  createdAt: string = new Date().toISOString(),
): Exercise {
  const normalized = normalizeCustomExerciseInput(input);

  return {
    id: createTimestampId("custom-exercise", createdAt),
    name: normalized.name,
    category: normalized.category,
    equipment: normalized.equipment,
    source: "custom",
    targetMuscles: [normalized.equipment],
  };
}

export function updateCustomExercise(
  exercise: Exercise,
  input: CustomExerciseInput,
): Exercise {
  if (!isCustomExercise(exercise)) {
    return exercise;
  }

  const normalized = normalizeCustomExerciseInput(input);

  return {
    ...exercise,
    name: normalized.name,
    category: normalized.category,
    equipment: normalized.equipment,
    source: "custom",
    targetMuscles: [normalized.equipment],
  };
}

export function snapshotWorkoutExerciseNames(
  session: WorkoutSession,
  exercises: Exercise[],
): WorkoutSession {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  return {
    ...session,
    entries: session.entries.map((entry) => ({
      ...entry,
      exerciseName:
        entry.exerciseName ?? exerciseById.get(entry.exerciseId)?.name,
    })),
  };
}

export function getTodayPlan(
  plans: WorkoutPlan[],
  today: Date = new Date(),
): WorkoutPlan | undefined {
  const weekday = today.getDay();

  return plans.find((plan) => plan.scheduledDays.includes(weekday)) ?? plans[0];
}

export function createDraftWorkout(
  plan: WorkoutPlan,
  startedAt: string = new Date().toISOString(),
): WorkoutSession {
  return {
    id: createId("draft", startedAt),
    planId: plan.id,
    planName: plan.name,
    date: toDateKey(startedAt),
    startedAt,
    status: "draft",
    totalSets: 0,
    totalVolumeKg: 0,
    entries: plan.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: [],
    })),
  };
}

export function createDraftWorkoutFromPlan(
  plan: WorkoutPlan,
  date: string = toDateKey(new Date().toISOString()),
): WorkoutSession {
  const safeDate = date || toDateKey(new Date().toISOString());

  return recalculateWorkoutTotals({
    id: createId("draft", `${safeDate}-${plan.id}`),
    planId: plan.id,
    planName: plan.name,
    date: safeDate,
    startedAt: `${safeDate}T00:00:00.000Z`,
    status: "draft",
    totalSets: 0,
    totalVolumeKg: 0,
    entries: plan.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: Array.from({ length: exercise.targetSets }, (_, index) => ({
        setNumber: index + 1,
        weightKg: 0,
        reps: normalizeNumber(exercise.targetReps),
        note: "",
        completed: false,
      })),
    })),
  });
}

export function createCustomDraftWorkout({
  name,
  date,
  note = "",
  exerciseIds,
}: {
  name: string;
  date: string;
  note?: string;
  exerciseIds: string[];
}): WorkoutSession {
  const safeDate = date || toDateKey(new Date().toISOString());
  const safeName = name.trim() || "未命名训练";

  return {
    id: createId("draft", `${safeDate}-${safeName}`),
    planId: "custom",
    planName: safeName,
    note: note.trim(),
    date: safeDate,
    startedAt: `${safeDate}T00:00:00.000Z`,
    status: "draft",
    totalSets: 0,
    totalVolumeKg: 0,
    entries: exerciseIds.map((exerciseId) => ({
      exerciseId,
      sets: [],
    })),
  };
}

export function createDraftFromPreviousWorkout(
  previousWorkout: WorkoutSession,
  date: string,
): WorkoutSession {
  const safeDate = date || toDateKey(new Date().toISOString());

  return recalculateWorkoutTotals({
    id: createId("draft", `${safeDate}-${previousWorkout.id}`),
    planId: previousWorkout.planId,
    planName: previousWorkout.planName,
    note: "",
    date: safeDate,
    startedAt: `${safeDate}T00:00:00.000Z`,
    status: "draft",
    totalSets: 0,
    totalVolumeKg: 0,
    entries: previousWorkout.entries.map((entry) => ({
      exerciseId: entry.exerciseId,
      sets: entry.sets.map((set) => ({
        setNumber: set.setNumber,
        weightKg: normalizeNumber(set.weightKg),
        reps: normalizeNumber(set.reps),
        note: "",
        completed: false,
      })),
    })),
  });
}

export function updateDraftMeta(
  draft: WorkoutSession,
  {
    name,
    date,
    note,
  }: {
    name: string;
    date: string;
    note?: string;
  },
): WorkoutSession {
  const safeDate = date || draft.date;

  return {
    ...draft,
    planName: name.trim() || "未命名训练",
    note: note === undefined ? draft.note : note.trim(),
    date: safeDate,
    startedAt: `${safeDate}T00:00:00.000Z`,
  };
}

export function addExerciseToDraft(
  draft: WorkoutSession,
  exerciseId: string,
): WorkoutSession {
  if (draft.entries.some((entry) => entry.exerciseId === exerciseId)) {
    return draft;
  }

  return {
    ...draft,
    entries: [...draft.entries, { exerciseId, sets: [] }],
  };
}

export function addExerciseWithDefaultSets(
  draft: WorkoutSession,
  exerciseId: string,
): WorkoutSession {
  const withExercise = addExerciseToDraft(draft, exerciseId);
  const entry = withExercise.entries.find((item) => item.exerciseId === exerciseId);

  if (!entry || entry.sets.length > 0) {
    return withExercise;
  }

  return [1, 2, 3].reduce(
    (current) =>
      addSetToDraftExercise(current, exerciseId, {
        weightKg: 0,
        reps: 0,
        note: "",
        completed: false,
      }),
    withExercise,
  );
}

export function removeExerciseFromDraft(
  draft: WorkoutSession,
  exerciseId: string,
): WorkoutSession {
  return recalculateWorkoutTotals({
    ...draft,
    entries: draft.entries.filter((entry) => entry.exerciseId !== exerciseId),
  });
}

export function addSetToDraftExercise(
  draft: WorkoutSession,
  exerciseId: string,
  set: SetInput,
): WorkoutSession {
  const hasExercise = draft.entries.some((entry) => entry.exerciseId === exerciseId);
  const entries = hasExercise
    ? draft.entries
    : [...draft.entries, { exerciseId, sets: [] }];

  const nextDraft = {
    ...draft,
    entries: entries.map((entry) => {
      if (entry.exerciseId !== exerciseId) {
        return entry;
      }

      const nextSet: WorkoutSet = {
        setNumber: entry.sets.length + 1,
        weightKg: normalizeNumber(set.weightKg),
        reps: normalizeNumber(set.reps),
        note: set.note.trim(),
        completed: set.completed,
      };
      const normalizedPre = normalizePre(set.pre);

      return {
        ...entry,
        sets: [
          ...entry.sets,
          normalizedPre === undefined
            ? nextSet
            : {
                ...nextSet,
                pre: normalizedPre,
              },
        ],
      };
    }),
  };

  return recalculateWorkoutTotals(nextDraft);
}

export function updateDraftSet(
  draft: WorkoutSession,
  exerciseId: string,
  setNumber: number,
  set: SetInput,
): WorkoutSession {
  const nextDraft = {
    ...draft,
    entries: draft.entries.map((entry) => {
      if (entry.exerciseId !== exerciseId) {
        return entry;
      }

      return {
        ...entry,
        sets: entry.sets.map((item) => {
          if (item.setNumber !== setNumber) {
            return item;
          }

          const nextSet: WorkoutSet = {
            setNumber: item.setNumber,
            weightKg: normalizeNumber(set.weightKg),
            reps: normalizeNumber(set.reps),
            note: set.note,
            completed: set.completed,
          };
          const normalizedPre = normalizePre(set.pre);

          return normalizedPre === undefined
            ? nextSet
            : {
                ...nextSet,
                pre: normalizedPre,
              };
        }),
      };
    }),
  };

  return recalculateWorkoutTotals(nextDraft);
}

export function removeDraftSet(
  draft: WorkoutSession,
  exerciseId: string,
  setNumber: number,
): WorkoutSession {
  const nextDraft = {
    ...draft,
    entries: draft.entries.map((entry) => {
      if (entry.exerciseId !== exerciseId) {
        return entry;
      }

      return {
        ...entry,
        sets: renumberSets(entry.sets.filter((set) => set.setNumber !== setNumber)),
      };
    }),
  };

  return recalculateWorkoutTotals(nextDraft);
}

export function completeDraftWorkout(
  draft: WorkoutSession,
  completedAt: string = new Date().toISOString(),
): WorkoutSession {
  return {
    ...recalculateWorkoutTotals(draft),
    id: createId("session", completedAt),
    completedAt,
    updatedAt: completedAt,
    status: "completed",
  };
}

export function addExerciseToPlan(
  plan: WorkoutPlan,
  exercise: PlannedExercise,
): WorkoutPlan {
  if (plan.exercises.some((item) => item.exerciseId === exercise.exerciseId)) {
    return plan;
  }

  return {
    ...plan,
    exercises: [...plan.exercises, exercise],
  };
}

export function createPlanFromTrainingTemplate(
  template: TrainingTemplate,
  createdAt: string = new Date().toISOString(),
): WorkoutPlan {
  const createdDate = new Date(createdAt);
  const scheduledDay = Number.isNaN(createdDate.getTime())
    ? new Date().getDay()
    : createdDate.getDay();

  return {
    id: createId("plan", `${template.id}-${createdAt}`),
    name: template.name,
    focus: template.focus,
    scheduledDays: [scheduledDay],
    exercises: template.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      targetSets: 3,
      targetReps: exercise.targetReps,
      restSeconds: 90,
    })),
  };
}

export function calculateExerciseProgress(
  sessions: WorkoutSession[],
  exerciseId: string,
): ExerciseProgressPoint[] {
  return sessions
    .filter((session) => session.status === "completed")
    .flatMap((session) => {
      const entry = session.entries.find((item) => item.exerciseId === exerciseId);
      if (!entry || entry.sets.length === 0) {
        return [];
      }

      const completedSets = entry.sets.filter((set) => set.completed);
      if (completedSets.length === 0) {
        return [];
      }

      const bestSet = completedSets.reduce((best, set) =>
        set.weightKg > best.weightKg ? set : best,
      );
      const bestVolumeSet = completedSets.reduce((best, set) =>
        set.weightKg * set.reps > best.weightKg * best.reps ? set : best,
      );

      return [
        {
          date: session.date,
          bestWeightKg: bestSet.weightKg,
          bestVolumeKg: bestVolumeSet.weightKg * bestVolumeSet.reps,
        },
      ];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getRecentExerciseTrainingRecords(
  sessions: WorkoutSession[],
  exerciseId: string,
  limit = 10,
): ExerciseTrainingRecord[] {
  return sessions
    .filter((session) => session.status === "completed")
    .flatMap((session) => {
      const entry = session.entries.find((item) => item.exerciseId === exerciseId);
      const completedSets = entry?.sets.filter((set) => set.completed) ?? [];

      if (completedSets.length === 0) {
        return [];
      }

      return [
        {
          sessionId: session.id,
          date: session.date,
          planName: session.planName,
          bestWeightKg: Math.max(...completedSets.map((set) => set.weightKg)),
          maxVolumeKg: Math.max(
            ...completedSets.map((set) => set.weightKg * set.reps),
          ),
        },
      ];
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.sessionId.localeCompare(a.sessionId))
    .slice(0, limit);
}

export function getDashboardMetrics(
  sessions: WorkoutSession[],
  today: Date = new Date(),
): DashboardMetrics {
  const completedSessions = sessions.filter(
    (session) => session.status === "completed",
  );
  const weekStart = getWeekStart(today);
  const exerciseCounts = new Map<string, number>();

  completedSessions.forEach((session) => {
    session.entries.forEach((entry) => {
      const completedSetCount = entry.sets.filter((set) => set.completed).length;
      if (completedSetCount > 0) {
        exerciseCounts.set(
          entry.exerciseId,
          (exerciseCounts.get(entry.exerciseId) ?? 0) + completedSetCount,
        );
      }
    });
  });

  return {
    totalWorkoutCount: completedSessions.length,
    weeklyWorkoutCount: completedSessions.filter(
      (session) => new Date(`${session.date}T00:00:00`).getTime() >= weekStart.getTime(),
    ).length,
    mostTrainedExerciseId: Array.from(exerciseCounts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0]?.[0],
  };
}

export function recalculateWorkoutTotals(session: WorkoutSession): WorkoutSession {
  const completedSets = session.entries
    .flatMap((entry) => entry.sets)
    .filter((set) => set.completed);

  return {
    ...session,
    totalSets: completedSets.length,
    totalVolumeKg: completedSets.reduce(
      (total, set) => total + set.weightKg * set.reps,
      0,
    ),
  };
}

function normalizeNumber(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function normalizePre(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  if (value < 0.5 || value > 10) {
    return undefined;
  }

  return Math.round(value * 2) / 2;
}

function renumberSets(sets: WorkoutSet[]) {
  return sets.map((set, index) => ({
    ...set,
    setNumber: index + 1,
  }));
}

function getWeekStart(today: Date) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekday = start.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  start.setDate(start.getDate() + mondayOffset);

  return start;
}
