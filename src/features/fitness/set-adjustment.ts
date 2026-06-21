export function adjustWorkoutSetValue(value: number, delta: number) {
  if (!Number.isFinite(value)) {
    return Math.max(0, delta);
  }

  return Math.max(0, value + delta);
}
