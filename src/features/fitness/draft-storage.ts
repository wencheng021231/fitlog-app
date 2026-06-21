import type { WorkoutSession } from "./types";

const PENDING_WORKOUT_DRAFT_KEY = "fitness-plan-app-pending-workout-draft-v1";

export function savePendingWorkoutDraft(draft: WorkoutSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    PENDING_WORKOUT_DRAFT_KEY,
    JSON.stringify(draft),
  );
}

export function consumePendingWorkoutDraft(): WorkoutSession | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const rawDraft = window.sessionStorage.getItem(PENDING_WORKOUT_DRAFT_KEY);
  if (!rawDraft) {
    return undefined;
  }

  window.sessionStorage.removeItem(PENDING_WORKOUT_DRAFT_KEY);

  try {
    const draft = JSON.parse(rawDraft) as Partial<WorkoutSession>;

    if (
      typeof draft.id !== "string" ||
      typeof draft.planName !== "string" ||
      !Array.isArray(draft.entries)
    ) {
      return undefined;
    }

    return draft as WorkoutSession;
  } catch {
    return undefined;
  }
}
