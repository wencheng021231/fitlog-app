"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  addExerciseWithDefaultSets,
  addSetToDraftExercise,
  recalculateWorkoutTotals,
  removeDraftSet,
  removeExerciseFromDraft,
} from "../domain";
import { formatDate, formatDateTime, formatSet, getExerciseName } from "../format";
import type { WorkoutSession } from "../types";
import { useFitnessStore } from "../use-fitness-store";
import {
  EmptyState,
  PageHeader,
  PrimaryButton,
  SelectInput,
  SecondaryButton,
  SectionTitle,
  TextArea,
  TextInput,
} from "../components/ui";

export function WorkoutDetailPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const {
    hydrated,
    exercises,
    sessions,
    exerciseById,
    updateSession,
    deleteSession,
  } = useFitnessStore();
  const session = useMemo(
    () => sessions.find((item) => item.id === sessionId),
    [sessionId, sessions],
  );
  const [draft, setDraft] = useState<WorkoutSession | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [newExerciseId, setNewExerciseId] = useState("");
  const activeSession = draft ?? session ?? null;

  if (!hydrated) {
    return (
      <div>
        <PageHeader eyebrow="详情" title="训练详情" />
        <EmptyState>正在读取训练记录。</EmptyState>
      </div>
    );
  }

  if (!session || !activeSession) {
    return (
      <div>
        <PageHeader eyebrow="详情" title="训练详情" />
        <EmptyState>没有找到这条训练记录。</EmptyState>
        <Link
          className="mt-4 flex min-h-12 items-center justify-center rounded-md border border-zinc-100 bg-white px-5 text-sm font-black text-zinc-950 shadow-sm"
          href="/history"
        >
          返回历史记录
        </Link>
      </div>
    );
  }

  const canSave =
    activeSession.planName.trim().length > 0 && activeSession.entries.length > 0;
  const availableExercises = exercises.filter(
    (exercise) =>
      !activeSession.entries.some((entry) => entry.exerciseId === exercise.id),
  );

  return (
    <div>
      <PageHeader
        description={`${formatDate(activeSession.date)} · 保存于 ${formatDateTime(
          activeSession.completedAt,
        )}`}
        eyebrow="详情"
        title={activeSession.planName}
      />

      <section className="mb-5 rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B6FF3B]">
              {activeSession.date}
            </p>
            <h2 className="mt-1 text-xl font-black text-zinc-950">
              {activeSession.planName}
            </h2>
            <p className="mt-2 text-sm font-semibold text-zinc-500">
              {activeSession.entries.length} 个动作 · {activeSession.totalSets} 组完成 · 总容量{" "}
              {Math.round(activeSession.totalVolumeKg)}kg
            </p>
            {activeSession.note ? (
              <p className="mt-3 rounded-md bg-zinc-50 px-3 py-2 text-sm font-semibold leading-6 text-zinc-600">
                {activeSession.note}
              </p>
            ) : null}
          </div>
          <span className="rounded-md bg-[#1d2a14] px-2 py-1 text-xs font-bold text-[#B6FF3B]">
            {editing ? "编辑中" : "已保存"}
          </span>
        </div>

        {editing ? (
          <div className="grid gap-3">
            <label>
              <span className="mb-1 block text-xs font-bold text-zinc-500">
                训练名称
              </span>
              <TextInput
                aria-label="训练名称"
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          planName: event.target.value,
                        }
                      : current,
                  )
                }
                value={activeSession.planName}
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold text-zinc-500">
                训练日期
              </span>
              <TextInput
                aria-label="训练日期"
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          date: event.target.value,
                          startedAt: `${event.target.value}T00:00:00.000Z`,
                        }
                      : current,
                  )
                }
                type="date"
                value={activeSession.date}
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold text-zinc-500">
                训练备注
              </span>
              <TextArea
                aria-label="训练备注"
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          note: event.target.value,
                        }
                      : current,
                  )
                }
                value={activeSession.note ?? ""}
              />
            </label>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <SectionTitle title="动作详情" tone="light" />
        {editing ? (
          <div className="rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
            <SectionTitle title="新增动作" />
            {availableExercises.length > 0 ? (
              <div className="grid gap-3">
                <SelectInput
                  aria-label="选择新增动作"
                  onChange={(event) => setNewExerciseId(event.target.value)}
                  value={newExerciseId}
                >
                  <option value="">选择动作</option>
                  {availableExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </SelectInput>
                <SecondaryButton
                  disabled={!newExerciseId}
                  onClick={() => {
                    if (!newExerciseId) {
                      return;
                    }

                    addDraftExercise(newExerciseId);
                    setNewExerciseId("");
                  }}
                  type="button"
                >
                  添加动作
                </SecondaryButton>
              </div>
            ) : (
              <p className="text-sm font-semibold text-zinc-500">
                动作库里的动作都已经加入当前训练。
              </p>
            )}
          </div>
        ) : null}
        {activeSession.entries.length === 0 ? (
          <EmptyState>当前训练没有动作，请至少添加一个动作后保存。</EmptyState>
        ) : null}
        {activeSession.entries.map((entry) => (
          <article
            className="rounded-md border border-zinc-100 bg-white p-4 shadow-sm"
            key={entry.exerciseId}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                {editing ? (
                  <SelectInput
                    aria-label="修改动作"
                    onChange={(event) =>
                      updateDraftExercise(entry.exerciseId, event.target.value)
                    }
                    value={entry.exerciseId}
                  >
                    {exercises
                      .filter(
                        (exercise) =>
                          exercise.id === entry.exerciseId ||
                          !activeSession.entries.some(
                            (item) => item.exerciseId === exercise.id,
                          ),
                      )
                      .map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                  </SelectInput>
                ) : (
                  <h2 className="text-lg font-black text-zinc-950">
                    {getExerciseName(
                      exerciseById,
                      entry.exerciseId,
                      entry.exerciseName,
                    )}
                  </h2>
                )}
              </div>
              <span className="text-xs font-bold text-zinc-500">
                {entry.sets.filter((set) => set.completed).length} 组完成
              </span>
            </div>
            {editing ? (
              <button
                className="mb-3 min-h-10 w-full rounded-md border border-[#7f1d2a] bg-[#2a0f12] px-3 text-sm font-black text-[#ff6b77]"
                onClick={() => removeDraftExercise(entry.exerciseId)}
                type="button"
              >
                删除动作
              </button>
            ) : null}

            {editing ? (
              <div className="space-y-3">
                {entry.sets.map((set) => (
                  <div
                    className="border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0"
                    key={set.setNumber}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-zinc-950">
                        第 {set.setNumber} 组
                      </p>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                          <input
                            checked={set.completed}
                            className="h-6 w-6 accent-[#B6FF3B]"
                            onChange={(event) =>
                              updateDraftSet(
                                set.setNumber,
                                entry.exerciseId,
                                "completed",
                                event.target.checked,
                              )
                            }
                            type="checkbox"
                          />
                          完成
                        </label>
                        <button
                          className="min-h-8 rounded-md px-2 text-xs font-bold text-zinc-500"
                          onClick={() =>
                            removeDraftWorkoutSet(
                              entry.exerciseId,
                              set.setNumber,
                            )
                          }
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label>
                        <span className="mb-1 block text-xs font-bold text-zinc-500">
                          重量 kg
                        </span>
                        <TextInput
                          aria-label={`第 ${set.setNumber} 组重量 kg`}
                          inputMode="decimal"
                          onChange={(event) =>
                            updateDraftSet(
                              set.setNumber,
                              entry.exerciseId,
                              "weightKg",
                              Number(event.target.value),
                            )
                          }
                          onFocus={(event) => event.currentTarget.select()}
                          value={set.weightKg}
                        />
                      </label>
                      <label>
                        <span className="mb-1 block text-xs font-bold text-zinc-500">
                          次数 reps
                        </span>
                        <TextInput
                          aria-label={`第 ${set.setNumber} 组次数 reps`}
                          inputMode="numeric"
                          onChange={(event) =>
                            updateDraftSet(
                              set.setNumber,
                              entry.exerciseId,
                              "reps",
                              Number(event.target.value),
                            )
                          }
                          onFocus={(event) => event.currentTarget.select()}
                          value={set.reps}
                        />
                      </label>
                    </div>
                    <label className="mt-2 block">
                      <span className="mb-1 block text-xs font-bold text-zinc-500">
                        备注
                      </span>
                      <TextArea
                        aria-label={`第 ${set.setNumber} 组备注`}
                        onChange={(event) =>
                          updateDraftSet(
                            set.setNumber,
                            entry.exerciseId,
                            "note",
                            event.target.value,
                          )
                        }
                        value={set.note}
                      />
                    </label>
                  </div>
                ))}
                <SecondaryButton
                  className="w-full"
                  onClick={() => addDraftSet(entry.exerciseId)}
                  type="button"
                >
                  新增一组
                </SecondaryButton>
              </div>
            ) : (
              <div className="space-y-1">
                {entry.sets.map((set) => (
                  <p
                    className={`text-sm leading-6 ${
                      set.completed
                        ? "text-zinc-700"
                        : "text-zinc-400 line-through"
                    }`}
                    key={set.setNumber}
                  >
                    {formatSet(set)}
                  </p>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      <div className="mt-5 space-y-3">
        {message ? (
          <p className="rounded-md bg-[#1d2a14] px-4 py-3 text-sm font-bold text-[#B6FF3B]">
            {message}
          </p>
        ) : null}
        {editing ? (
          <PrimaryButton
            className="w-full"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) {
                return;
              }

              if (!draft) {
                return;
              }

              updateSession({
                ...draft,
                planName: draft.planName.trim(),
                note: draft.note?.trim(),
              });
              setDraft(null);
              setEditing(false);
              setMessage("训练记录已更新。");
            }}
            type="button"
          >
            保存修改
          </PrimaryButton>
        ) : (
          <SecondaryButton
            className="w-full"
            onClick={() => {
              setDraft(session);
              setEditing(true);
              setMessage("");
            }}
            type="button"
          >
            编辑训练
          </SecondaryButton>
        )}
        <SecondaryButton
          className="w-full"
          onClick={() => {
            if (editing) {
              setDraft(null);
              setEditing(false);
              setMessage("");
              return;
            }

            router.push("/history");
          }}
          type="button"
        >
          {editing ? "取消编辑" : "返回历史"}
        </SecondaryButton>
        <button
          className="min-h-12 w-full rounded-md border border-[#7f1d2a] bg-[#2a0f12] px-5 text-sm font-black text-[#ff6b77]"
          onClick={() => {
            if (!window.confirm("确定删除这条训练记录吗？")) {
              return;
            }

            deleteSession(session.id);
            router.push("/history");
          }}
          type="button"
        >
          删除训练
        </button>
      </div>
    </div>
  );

  function updateDraftSet<T extends "weightKg" | "reps" | "note" | "completed">(
    setNumber: number,
    exerciseId: string,
    field: T,
    value: WorkoutSession["entries"][number]["sets"][number][T],
  ) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return recalculateWorkoutTotals({
        ...current,
        entries: current.entries.map((entry) => {
          if (entry.exerciseId !== exerciseId) {
            return entry;
          }

          return {
            ...entry,
            sets: entry.sets.map((set) =>
              set.setNumber === setNumber
                ? {
                    ...set,
                    [field]: value,
                  }
                : set,
            ),
          };
        }),
      });
    });
  }

  function updateDraftExercise(exerciseId: string, nextExerciseId: string) {
    if (!nextExerciseId || exerciseId === nextExerciseId) {
      return;
    }

    setDraft((current) => {
      if (
        !current ||
        current.entries.some((entry) => entry.exerciseId === nextExerciseId)
      ) {
        return current;
      }

      return {
        ...current,
        entries: current.entries.map((entry) =>
          entry.exerciseId === exerciseId
            ? {
                ...entry,
                exerciseId: nextExerciseId,
                exerciseName: exercises.find(
                  (exercise) => exercise.id === nextExerciseId,
                )?.name,
              }
            : entry,
        ),
      };
    });
  }

  function addDraftExercise(exerciseId: string) {
    setDraft((current) =>
      current ? addExerciseWithDefaultSets(current, exerciseId) : current,
    );
  }

  function removeDraftExercise(exerciseId: string) {
    setDraft((current) =>
      current ? removeExerciseFromDraft(current, exerciseId) : current,
    );
  }

  function addDraftSet(exerciseId: string) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const entry = current.entries.find((item) => item.exerciseId === exerciseId);
      const lastSet = entry?.sets.at(-1);

      return addSetToDraftExercise(current, exerciseId, {
        weightKg: lastSet?.weightKg ?? 0,
        reps: lastSet?.reps ?? 0,
        note: "",
        completed: false,
      });
    });
  }

  function removeDraftWorkoutSet(exerciseId: string, setNumber: number) {
    setDraft((current) =>
      current ? removeDraftSet(current, exerciseId, setNumber) : current,
    );
  }
}
