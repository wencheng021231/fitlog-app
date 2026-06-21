import type { Exercise, WorkoutPlan, WorkoutSession } from "./types";

export type ExportableFitnessState = {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
};

type FitnessBackupPayload = {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
};

type FitnessBackupFile = {
  app: string;
  version: 1;
  exportedAt: string;
  data: FitnessBackupPayload;
};

type ImportSummary = {
  exercises: number;
  plans: number;
  sessions: number;
};

export type ImportFitnessBackupResult =
  | {
      ok: true;
      state: ExportableFitnessState;
      summary: ImportSummary;
    }
  | {
      ok: false;
      message: string;
    };

export function createClearedFitnessState(
  exercises: Exercise[],
): ExportableFitnessState {
  return {
    exercises,
    plans: [],
    sessions: [],
  };
}

export function serializeFitnessState(state: ExportableFitnessState) {
  const backup: FitnessBackupFile = {
    app: "练！Fit",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      exercises: state.exercises.filter((exercise) => exercise.source === "custom"),
      plans: state.plans,
      sessions: state.sessions,
    },
  };

  return JSON.stringify(backup, null, 2);
}

export function createBackupFileName(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `fitlog-backup-${year}-${month}-${day}.json`;
}

export function importFitnessBackup(
  currentState: ExportableFitnessState,
  rawBackup: string,
): ImportFitnessBackupResult {
  const parsed = parseBackupJson(rawBackup);

  if (!parsed.ok) {
    return parsed;
  }

  const payload = getBackupPayload(parsed.value);

  if (!payload || !isBackupPayload(payload)) {
    return {
      ok: false,
      message: "备份文件格式不正确，请选择练！Fit 导出的 JSON 文件。",
    };
  }

  return mergeFitnessState(currentState, payload);
}

function parseBackupJson(rawBackup: string):
  | { ok: true; value: unknown }
  | { ok: false; message: string } {
  try {
    return {
      ok: true,
      value: JSON.parse(rawBackup) as unknown,
    };
  } catch {
    return {
      ok: false,
      message: "无法读取备份文件，请确认这是有效的 JSON 文件。",
    };
  }
}

function getBackupPayload(value: unknown): Partial<FitnessBackupPayload> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<FitnessBackupFile> &
    Partial<FitnessBackupPayload>;

  if (candidate.data && typeof candidate.data === "object") {
    return candidate.data;
  }

  return candidate;
}

function isBackupPayload(
  payload: Partial<FitnessBackupPayload>,
): payload is FitnessBackupPayload {
  return (
    Array.isArray(payload.exercises) &&
    Array.isArray(payload.plans) &&
    Array.isArray(payload.sessions) &&
    payload.exercises.every(isExercise) &&
    payload.plans.every(isWorkoutPlan) &&
    payload.sessions.every(isWorkoutSession)
  );
}

function mergeFitnessState(
  currentState: ExportableFitnessState,
  backup: FitnessBackupPayload,
): ImportFitnessBackupResult {
  const currentExerciseIds = new Set(
    currentState.exercises.map((exercise) => exercise.id),
  );
  const importedExercises = backup.exercises
    .filter((exercise) => exercise.source !== "built-in")
    .map(normalizeImportedCustomExercise)
    .filter((exercise) => !currentExerciseIds.has(exercise.id));

  const currentPlanIds = new Set(currentState.plans.map((plan) => plan.id));
  const importedPlans = backup.plans.filter((plan) => !currentPlanIds.has(plan.id));

  const currentSessionIds = new Set(
    currentState.sessions.map((session) => session.id),
  );
  const importedSessions = backup.sessions.filter(
    (session) => !currentSessionIds.has(session.id),
  );

  return {
    ok: true,
    state: {
      exercises: [...currentState.exercises, ...importedExercises],
      plans: [...currentState.plans, ...importedPlans],
      sessions: [...importedSessions, ...currentState.sessions],
    },
    summary: {
      exercises: importedExercises.length,
      plans: importedPlans.length,
      sessions: importedSessions.length,
    },
  };
}

function normalizeImportedCustomExercise(exercise: Exercise): Exercise {
  const equipment = exercise.equipment ?? exercise.targetMuscles[0] ?? "其他";

  return {
    ...exercise,
    equipment,
    source: "custom",
    targetMuscles: exercise.targetMuscles.length > 0 ? exercise.targetMuscles : [equipment],
  };
}

function isExercise(value: unknown): value is Exercise {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Exercise>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.category === "string" &&
    Array.isArray(candidate.targetMuscles) &&
    candidate.targetMuscles.every((item) => typeof item === "string")
  );
}

function isWorkoutPlan(value: unknown): value is WorkoutPlan {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WorkoutPlan>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.focus === "string" &&
    Array.isArray(candidate.scheduledDays) &&
    candidate.scheduledDays.every((day) => typeof day === "number") &&
    Array.isArray(candidate.exercises) &&
    candidate.exercises.every(
      (exercise) =>
        exercise &&
        typeof exercise === "object" &&
        typeof exercise.exerciseId === "string" &&
        typeof exercise.targetSets === "number" &&
        typeof exercise.targetReps === "number" &&
        typeof exercise.restSeconds === "number",
    )
  );
}

function isWorkoutSession(value: unknown): value is WorkoutSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WorkoutSession>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.planId === "string" &&
    typeof candidate.planName === "string" &&
    typeof candidate.date === "string" &&
    typeof candidate.startedAt === "string" &&
    (candidate.status === "draft" || candidate.status === "completed") &&
    typeof candidate.totalSets === "number" &&
    typeof candidate.totalVolumeKg === "number" &&
    Array.isArray(candidate.entries) &&
    candidate.entries.every(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        typeof entry.exerciseId === "string" &&
        Array.isArray(entry.sets) &&
        entry.sets.every(
          (set) =>
            set &&
            typeof set === "object" &&
            typeof set.setNumber === "number" &&
            typeof set.weightKg === "number" &&
            typeof set.reps === "number" &&
            typeof set.note === "string" &&
            typeof set.completed === "boolean",
        ),
    )
  );
}
