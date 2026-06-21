import type { ExerciseProgressPoint } from "../types";

export function WeightTrendChart({ points }: { points: ExerciseProgressPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center rounded-md bg-zinc-50 text-sm font-semibold text-zinc-400">
        暂无趋势数据
      </div>
    );
  }

  const width = 320;
  const height = 208;
  const padding = 28;
  const weights = points.map((point) => point.bestWeightKg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = Math.max(maxWeight - minWeight, 1);
  const xStep =
    points.length === 1 ? 0 : (width - padding * 2) / (points.length - 1);
  const chartPoints = points.map((point, index) => {
    const x =
      points.length === 1 ? width / 2 : padding + index * xStep;
    const y =
      height -
      padding -
      ((point.bestWeightKg - minWeight) / weightRange) *
        (height - padding * 2);

    return { ...point, x, y };
  });
  const path = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="rounded-md bg-zinc-50 p-3">
      <svg
        aria-label="动作重量变化图"
        className="h-52 w-full"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
          x1={padding}
          x2={width - padding}
          y1={height - padding}
          y2={height - padding}
        />
        <line
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
          x1={padding}
          x2={padding}
          y1={padding}
          y2={height - padding}
        />
        <path d={path} fill="none" stroke="#B6FF3B" strokeWidth="4" />
        {chartPoints.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} fill="#0B0F14" r="5" stroke="#B6FF3B" />
            <text
              fill="#F6F8FB"
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              x={point.x}
              y={Math.max(point.y - 10, 12)}
            >
              {point.bestWeightKg}kg
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs font-bold text-zinc-500">
        <span>{points[0]?.date}</span>
        <span>{points.at(-1)?.date}</span>
      </div>
    </div>
  );
}
