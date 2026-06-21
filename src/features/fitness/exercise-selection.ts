import type { Exercise } from "./types";

export const workoutPickerCategories = [
  "胸部",
  "肩部",
  "腿部",
  "背部",
  "腹部",
  "自重",
] as const;

type WorkoutPickerCategory = (typeof workoutPickerCategories)[number];

export type ExerciseSelectionGroup = {
  category: WorkoutPickerCategory;
  exercises: Exercise[];
};

export function getExerciseSelectionGroups(
  exercises: Exercise[],
): ExerciseSelectionGroup[] {
  return workoutPickerCategories.map((category) => ({
    category,
    exercises: exercises.filter(
      (exercise) => getWorkoutPickerCategory(exercise) === category,
    ),
  }));
}

function getWorkoutPickerCategory(
  exercise: Exercise,
): WorkoutPickerCategory | undefined {
  if (isBodyweightExercise(exercise)) {
    return "自重";
  }

  if (exercise.category === "胸部") {
    return "胸部";
  }

  if (exercise.category === "肩部") {
    return "肩部";
  }

  if (exercise.category === "腿部") {
    return "腿部";
  }

  if (exercise.category === "背部") {
    return "背部";
  }

  if (exercise.category === "腹部") {
    return "腹部";
  }

  return undefined;
}

function isBodyweightExercise(exercise: Exercise) {
  const bodyweightKeywords = [
    "自重",
    "俯卧撑",
    "引体向上",
    "双杠",
    "凳上反屈伸",
  ];
  const source = [exercise.name, exercise.category, ...exercise.targetMuscles].join(
    " ",
  );

  return bodyweightKeywords.some((keyword) => source.includes(keyword));
}
