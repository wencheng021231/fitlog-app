export type Exercise = {
  id: string;
  name: string;
  category: string;
  equipment?: string;
  source?: "built-in" | "custom";
  targetMuscles: string[];
};

export type PlannedExercise = {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  focus: string;
  scheduledDays: number[];
  exercises: PlannedExercise[];
};

export type TrainingTemplateExercise = {
  exerciseId: string;
  targetReps: number;
};

export type TrainingTemplate = {
  id: string;
  name: string;
  focus: string;
  exercises: TrainingTemplateExercise[];
};

export type WorkoutSet = {
  setNumber: number;
  weightKg: number;
  reps: number;
  note: string;
  pre?: number;
  completed: boolean;
};

export type WorkoutEntry = {
  exerciseId: string;
  exerciseName?: string;
  sets: WorkoutSet[];
};

export type WorkoutSessionStatus = "draft" | "completed";

export type WorkoutSession = {
  id: string;
  planId: string;
  planName: string;
  note?: string;
  date: string;
  startedAt: string;
  completedAt?: string;
  updatedAt?: string;
  status: WorkoutSessionStatus;
  totalSets: number;
  totalVolumeKg: number;
  entries: WorkoutEntry[];
};

export type ExerciseProgressPoint = {
  date: string;
  bestWeightKg: number;
  bestVolumeKg: number;
};

export type ExerciseTrainingRecord = {
  sessionId: string;
  date: string;
  planName: string;
  bestWeightKg: number;
  maxVolumeKg: number;
};

export type DashboardMetrics = {
  totalWorkoutCount: number;
  weeklyWorkoutCount: number;
  mostTrainedExerciseId?: string;
};
