export const preScaleMin = 0.5;
export const preScaleMax = 10;
export const preScaleStep = 0.5;

export const preScaleValues = Array.from(
  { length: (preScaleMax - preScaleMin) / preScaleStep + 1 },
  (_, index) => preScaleMin + index * preScaleStep,
);

export function normalizePreScaleValue(value: number) {
  if (!Number.isFinite(value)) {
    return preScaleMin;
  }

  const clamped = Math.min(preScaleMax, Math.max(preScaleMin, value));

  return Math.round(clamped / preScaleStep) * preScaleStep;
}

export function getPreSliderPercent(value: number) {
  const normalized = normalizePreScaleValue(value);
  const percent =
    ((normalized - preScaleMin) / (preScaleMax - preScaleMin)) * 100;

  return Math.round(percent * 100) / 100;
}
