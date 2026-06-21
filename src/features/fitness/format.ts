import type { Exercise, WorkoutEntry, WorkoutSet } from "./types";

export const weekDays = [
  { value: 0, label: "周日" },
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
];

export function formatWeekDays(days: number[]) {
  if (days.length === 0) {
    return "未安排";
  }

  return days
    .map((day) => weekDays.find((item) => item.value === day)?.label)
    .filter(Boolean)
    .join("、");
}

export function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const weekday = weekDays[new Date(year, month - 1, day).getDay()]?.label ?? "";

  return `${month}月${day}日${weekday}`;
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "未完成";
  }

  const [datePart, timePart = "00:00"] = value.split("T");
  const [, month = "1", day = "1"] = datePart.split("-");
  const [hour = "00", minute = "00"] = timePart.split(":");

  return `${Number(month)}月${Number(day)}日 ${hour}:${minute}`;
}

export function getExerciseName(
  exercises: Map<string, Exercise>,
  exerciseId: string,
  fallbackName?: string,
) {
  return fallbackName ?? exercises.get(exerciseId)?.name ?? "未知动作";
}

export function summarizeEntry(entry: WorkoutEntry) {
  const completedSets = entry.sets.filter((set) => set.completed);

  if (completedSets.length === 0) {
    return "尚未记录组数";
  }

  const bestWeight = Math.max(...completedSets.map((set) => set.weightKg));
  const totalVolume = completedSets.reduce(
    (total, set) => total + set.weightKg * set.reps,
    0,
  );

  return `${completedSets.length} 组完成 · 最高 ${bestWeight}kg · 容量 ${totalVolume}kg`;
}

export function formatSet(set: WorkoutSet) {
  return `第 ${set.setNumber} 组 · ${set.completed ? "完成" : "未完成"} · ${set.weightKg}kg × ${set.reps} reps${
    set.pre ? ` · PRE ${set.pre}` : ""
  }${
    set.note ? ` · ${set.note}` : ""
  }`;
}
