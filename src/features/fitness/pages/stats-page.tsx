"use client";

import { useMemo, useState } from "react";

import { getRecentExerciseTrainingRecords } from "../domain";
import { formatDate } from "../format";
import { useFitnessStore } from "../use-fitness-store";
import {
  EmptyState,
  Metric,
  PageHeader,
  SectionTitle,
  SelectInput,
} from "../components/ui";

export function StatsPage() {
  const { exercises, sessions } = useFitnessStore();
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id ?? "");
  const selectedExercise =
    exercises.find((exercise) => exercise.id === selectedExerciseId) ?? exercises[0];
  const records = useMemo(
    () =>
      selectedExercise
        ? getRecentExerciseTrainingRecords(sessions, selectedExercise.id)
        : [],
    [selectedExercise, sessions],
  );
  const bestWeight = records.reduce(
    (best, record) => Math.max(best, record.bestWeightKg),
    0,
  );
  const bestVolume = records.reduce(
    (best, record) => Math.max(best, record.maxVolumeKg),
    0,
  );

  return (
    <div>
      <PageHeader
        description="选择一个动作，查看最近 10 次训练中的最高重量和最大训练容量。"
        eyebrow="统计"
        title="动作数据"
      />

      {exercises.length === 0 ? (
        <EmptyState>动作库为空，暂无统计数据。</EmptyState>
      ) : (
        <>
          <section className="mb-5 rounded-md border border-[#252525] bg-[#141414] p-4 shadow-sm">
            <SectionTitle title="选择动作" tone="light" />
            <SelectInput
              onChange={(event) => setSelectedExerciseId(event.target.value)}
              value={selectedExercise?.id}
            >
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </SelectInput>
          </section>

          <section className="mb-5 grid grid-cols-3 gap-2">
            <Metric label="最近记录" tone="red" value={`${records.length}`} />
            <Metric label="最高重量" tone="zinc" value={`${bestWeight}kg`} />
            <Metric label="最大容量" tone="zinc" value={`${bestVolume}kg`} />
          </section>

          <section>
            <SectionTitle
              aside={
                <span className="text-sm font-bold text-zinc-400">
                  最近 10 次
                </span>
              }
              title={selectedExercise?.name ?? "动作记录"}
              tone="light"
            />
            {records.length === 0 ? (
              <EmptyState>这个动作还没有训练记录。</EmptyState>
            ) : (
              <div className="space-y-3">
                {records.map((record, index) => (
                  <article
                    className="rounded-md border border-[#252525] bg-[#141414] p-4 shadow-sm"
                    key={`${record.sessionId}-${record.date}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B6FF3B]">
                          #{index + 1} · {formatDate(record.date)}
                        </p>
                        <h2 className="mt-1 text-lg font-black text-white">
                          {record.planName}
                        </h2>
                      </div>
                      <span className="rounded-md bg-[#1d2a14] px-2 py-1 text-xs font-bold text-[#B6FF3B]">
                        {record.date}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-[#1f1f22] px-3 py-3">
                        <p className="text-xs font-bold text-zinc-400">
                          最高重量
                        </p>
                        <p className="mt-1 text-2xl font-black text-white">
                          {record.bestWeightKg}kg
                        </p>
                      </div>
                      <div className="rounded-md bg-[#1f1f22] px-3 py-3">
                        <p className="text-xs font-bold text-zinc-400">
                          最大容量
                        </p>
                        <p className="mt-1 text-2xl font-black text-white">
                          {record.maxVolumeKg}kg
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
