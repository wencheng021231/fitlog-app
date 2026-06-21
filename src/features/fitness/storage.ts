import { initialFitnessState } from "./mock-data";
import type {
  Exercise,
  WorkoutEntry,
  WorkoutPlan,
  WorkoutSession,
  WorkoutSet,
} from "./types";

const STORAGE_KEY = "fitness-plan-app-state-v1";

export type FitnessState = {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
};

export function loadFitnessState(): FitnessState {
  if (typeof window === "undefined") {
    return initialFitnessState;
  }

  const rawState = window.localStorage.getItem(STORAGE_KEY);
  if (!rawState) {
    return initialFitnessState;
  }

  try {
    const parsed = JSON.parse(rawState) as Partial<FitnessState>;

    const exercises = mergeExercises(parsed.exercises);
    const sessions = Array.isArray(parsed.sessions)
      ? parsed.sessions.map((session) => normalizeSession(session, exercises))
      : initialFitnessState.sessions;

    return {
      exercises,
      plans: Array.isArray(parsed.plans) ? parsed.plans : initialFitnessState.plans,
      sessions,
    };
  } catch {
    return initialFitnessState;
  }
}

export function saveFitnessState(state: FitnessState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetFitnessState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

function normalizeSession(
  session: WorkoutSession,
  exercises: Exercise[],
): WorkoutSession {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const entries: WorkoutEntry[] = session.entries.map((entry) => ({
    ...entry,
    exerciseName:
      entry.exerciseName ?? exerciseById.get(entry.exerciseId)?.name,
    sets: entry.sets.map(normalizeSet),
  }));

  const completedSets = entries
    .flatMap((entry) => entry.sets)
    .filter((set) => set.completed);

  return {
    ...session,
    entries,
    totalSets: completedSets.length,
    totalVolumeKg: completedSets.reduce(
      (total, set) => total + set.weightKg * set.reps,
      0,
    ),
  };
}

function normalizeSet(set: WorkoutSet): WorkoutSet {
  const normalizedSet: WorkoutSet = {
    ...set,
    completed: typeof set.completed === "boolean" ? set.completed : true,
  };

  if (
    typeof normalizedSet.pre !== "number" ||
    normalizedSet.pre < 0.5 ||
    normalizedSet.pre > 10
  ) {
    delete normalizedSet.pre;
  }

  return normalizedSet;
}

function mergeExercises(exercises: unknown): Exercise[] {
  if (!Array.isArray(exercises)) {
    return initialFitnessState.exercises;
  }

  const builtInIds = new Set(
    initialFitnessState.exercises.map((exercise) => exercise.id),
  );
  const customExercises = exercises
    .filter(
      (exercise): exercise is Exercise =>
        isExercise(exercise) && !builtInIds.has(exercise.id),
    )
    .map(normalizeCustomExercise);

  return [...initialFitnessState.exercises, ...customExercises];
}

function normalizeCustomExercise(exercise: Exercise): Exercise {
  const equipment =
    typeof exercise.equipment === "string" && exercise.equipment.trim()
      ? exercise.equipment.trim()
      : exercise.targetMuscles[0] ?? "其他";

  return {
    ...exercise,
    category: exercise.category.trim() || "其他",
    equipment,
    source: "custom",
    targetMuscles: exercise.targetMuscles.length > 0 ? exercise.targetMuscles : [equipment],
  };
}

function isExercise(exercise: unknown): exercise is Exercise {
  if (!exercise || typeof exercise !== "object") {
    return false;
  }

  const candidate = exercise as Partial<Exercise>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.category === "string" &&
    Array.isArray(candidate.targetMuscles)
  );
}
