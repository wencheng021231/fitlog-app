"use client";

import { useEffect, useMemo, useState } from "react";

import {
  addExerciseToPlan,
  createCustomExercise,
  createPlanFromTrainingTemplate,
  isCustomExercise,
  recalculateWorkoutTotals,
  snapshotWorkoutExerciseNames,
  updateCustomExercise,
} from "./domain";
import { initialFitnessState } from "./mock-data";
import {
  createClearedFitnessState,
  importFitnessBackup,
  serializeFitnessState,
} from "./storage-helpers";
import {
  loadFitnessState,
  resetFitnessState,
  saveFitnessState,
  type FitnessState,
} from "./storage";
import type {
  PlannedExercise,
  TrainingTemplate,
  WorkoutPlan,
  WorkoutSession,
} from "./types";

type NewPlanInput = {
  name: string;
  focus: string;
  scheduledDays: number[];
  firstExercise: PlannedExercise;
};

type NewExerciseInput = {
  name: string;
  category: string;
  equipment?: string;
  targetMuscles?: string[];
};

const createSlug = (value: string, fallback: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
};

export function useFitnessStore() {
  const [state, setState] = useState<FitnessState>(initialFitnessState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadFitnessState());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveFitnessState(state);
    }
  }, [hydrated, state]);

  const exerciseById = useMemo(
    () => new Map(state.exercises.map((exercise) => [exercise.id, exercise])),
    [state.exercises],
  );

  const addExercise = (input: NewExerciseInput) => {
    const exercise = createCustomExercise({
      name: input.name,
      category: input.category,
      equipment: input.equipment ?? input.targetMuscles?.[0] ?? "其他",
    });

    setState((current) => ({
      ...current,
      exercises: [...current.exercises, exercise],
    }));

    return exercise;
  };

  const updateExercise = (exerciseId: string, input: NewExerciseInput) => {
    setState((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? updateCustomExercise(exercise, {
              name: input.name,
              category: input.category,
              equipment: input.equipment ?? input.targetMuscles?.[0] ?? "其他",
            })
          : exercise,
      ),
    }));
  };

  const deleteExercise = (exerciseId: string) => {
    setState((current) => {
      const exercise = current.exercises.find((item) => item.id === exerciseId);

      if (!exercise || !isCustomExercise(exercise)) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.filter((item) => item.id !== exerciseId),
        sessions: current.sessions.map((session) =>
          snapshotWorkoutExerciseNames(session, current.exercises),
        ),
      };
    });
  };

  const addPlan = (input: NewPlanInput) => {
    const plan: WorkoutPlan = {
      id: `${createSlug(input.name, "plan")}-${Date.now()}`,
      name: input.name.trim(),
      focus: input.focus.trim() || "综合训练",
      scheduledDays:
        input.scheduledDays.length > 0 ? input.scheduledDays : [new Date().getDay()],
      exercises: [input.firstExercise],
    };

    setState((current) => ({
      ...current,
      plans: [...current.plans, plan],
    }));

    return plan;
  };

  const addPlanFromTemplate = (template: TrainingTemplate) => {
    const plan = createPlanFromTrainingTemplate(template);

    setState((current) => ({
      ...current,
      plans: [plan, ...current.plans],
    }));

    return plan;
  };

  const addExerciseToExistingPlan = (
    planId: string,
    plannedExercise: PlannedExercise,
  ) => {
    setState((current) => ({
      ...current,
      plans: current.plans.map((plan) =>
        plan.id === planId ? addExerciseToPlan(plan, plannedExercise) : plan,
      ),
    }));
  };

  const saveSession = (session: WorkoutSession) => {
    setState((current) => {
      const nextSession = snapshotWorkoutExerciseNames(session, current.exercises);

      return {
        ...current,
        sessions: [
          nextSession,
          ...current.sessions.filter((item) => item.id !== nextSession.id),
        ],
      };
    });
  };

  const updateSession = (session: WorkoutSession) => {
    setState((current) => {
      const nextSession = snapshotWorkoutExerciseNames(
        recalculateWorkoutTotals({
          ...session,
          updatedAt: new Date().toISOString(),
        }),
        current.exercises,
      );

      return {
        ...current,
        sessions: current.sessions.map((item) =>
          item.id === nextSession.id ? nextSession : item,
        ),
      };
    });
  };

  const deleteSession = (sessionId: string) => {
    setState((current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session.id !== sessionId),
    }));
  };

  const restoreDemoData = () => {
    resetFitnessState();
    setState(initialFitnessState);
  };

  const clearUserData = () => {
    setState(createClearedFitnessState(initialFitnessState.exercises));
  };

  const exportData = () => serializeFitnessState(state);

  const importData = (rawBackup: string) => {
    const result = importFitnessBackup(state, rawBackup);

    if (result.ok) {
      setState(result.state);
    }

    return result;
  };

  return {
    ...state,
    hydrated,
    exerciseById,
    addExercise,
    updateExercise,
    deleteExercise,
    addPlan,
    addPlanFromTemplate,
    addExerciseToExistingPlan,
    saveSession,
    updateSession,
    deleteSession,
    restoreDemoData,
    clearUserData,
    exportData,
    importData,
  };
}
