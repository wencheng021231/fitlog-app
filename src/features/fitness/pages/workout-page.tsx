"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";

import {
  addExerciseWithDefaultSets,
  addSetToDraftExercise,
  completeDraftWorkout,
  createCustomDraftWorkout,
  removeDraftSet,
  removeExerciseFromDraft,
  updateDraftMeta,
  updateDraftSet,
} from "../domain";
import { consumePendingWorkoutDraft } from "../draft-storage";
import {
  getExerciseSelectionGroups,
  type ExerciseSelectionGroup,
} from "../exercise-selection";
import { getExerciseName, summarizeEntry } from "../format";
import {
  getPreSliderPercent,
  preScaleMax,
  preScaleMin,
  preScaleStep,
} from "../pre-scale";
import { adjustWorkoutSetValue } from "../set-adjustment";
import { useFitnessStore } from "../use-fitness-store";
import type { WorkoutEntry, WorkoutSession, WorkoutSet } from "../types";
import {
  EmptyState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  TextArea,
  TextInput,
} from "../components/ui";

export function WorkoutPage() {
  const router = useRouter();
  const { exercises, exerciseById, addExercise, saveSession } = useFitnessStore();
  const [copiedDraft] = useState(() => consumePendingWorkoutDraft());
  const [draft, setDraft] = useState<WorkoutSession>(
    () =>
      copiedDraft ??
      createCustomDraftWorkout({
        name: "",
        date: getTodayInputValue(),
        exerciseIds: [],
      }),
  );
  const [activeExerciseCategory, setActiveExerciseCategory] = useState("胸部");
  const [message, setMessage] = useState(
    copiedDraft ? "已载入训练草稿，可继续编辑重量和次数后保存。" : "",
  );
  const availableExercises = exercises.filter(
    (exercise) => !draft.entries.some((entry) => entry.exerciseId === exercise.id),
  );
  const exerciseGroups = getExerciseSelectionGroups(availableExercises);
  const canSave = draft.planName.trim().length > 0 && draft.entries.length > 0;

  return (
    <div>
      <PageHeader
        description="创建训练、添加动作、添加组数，并填写每组重量和次数。"
        eyebrow="训练"
        title="训练"
      />

      <section className="mb-5 rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
        <SectionTitle title="创建训练" />
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-500">
              训练名称
            </span>
            <TextInput
              onChange={(event) => {
                setDraft((current) =>
                  updateDraftMeta(current, {
                    name: event.target.value,
                    date: current.date,
                    note: current.note,
                  }),
                );
                setMessage("");
              }}
              placeholder="例如 胸肩三头、背部训练、腿部训练"
              value={draft.planName === "未命名训练" ? "" : draft.planName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-500">
              训练日期
            </span>
            <TextInput
              onChange={(event) => {
                setDraft((current) =>
                  updateDraftMeta(current, {
                    name: current.planName,
                    date: event.target.value,
                    note: current.note,
                  }),
                );
                setMessage("");
              }}
              type="date"
              value={draft.date}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-500">
              训练备注
            </span>
            <TextArea
              onChange={(event) => {
                setDraft((current) =>
                  updateDraftMeta(current, {
                    name: current.planName,
                    date: current.date,
                    note: event.target.value,
                  }),
                );
                setMessage("");
              }}
              placeholder="例如 今天状态、训练重点或恢复情况"
              value={draft.note ?? ""}
            />
          </label>
        </div>
      </section>

      <section className="mb-5 rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
        <SectionTitle title="添加动作" />
        {exercises.length === 0 ? (
          <EmptyState>动作库为空，请先在动作库添加动作。</EmptyState>
        ) : availableExercises.length > 0 ? (
          <ExercisePicker
            activeCategory={activeExerciseCategory}
            groups={exerciseGroups}
            onAddExercise={(exerciseId) => {
              setDraft((current) =>
                addExerciseWithDefaultSets(current, exerciseId),
              );
              setMessage("");
            }}
            onCategoryChange={setActiveExerciseCategory}
          />
        ) : (
          <p className="text-sm font-semibold text-zinc-500">
            动作库里的动作都已经加入当前训练。
          </p>
        )}

        <CustomExerciseForm
          onCreate={(input) => {
            const exercise = addExercise(input);
            setDraft((current) => addExerciseWithDefaultSets(current, exercise.id));
            setMessage("");
          }}
        />
      </section>

      <section className="space-y-3">
        <SectionTitle
          aside={
            <span className="text-sm font-bold text-zinc-300">
              {draft.totalSets} 组完成 · {Math.round(draft.totalVolumeKg)}kg
            </span>
          }
          tone="light"
          title="动作记录"
        />
        {draft.entries.length === 0 ? (
          <EmptyState>请先添加训练动作。</EmptyState>
        ) : (
          draft.entries.map((entry) => (
            <WorkoutEntryEditor
              entry={entry}
              exerciseName={getExerciseName(
                exerciseById,
                entry.exerciseId,
                entry.exerciseName,
              )}
              key={entry.exerciseId}
              onAddSet={() => {
                const lastSet = entry.sets.at(-1);
                setDraft((current) =>
                  addSetToDraftExercise(current, entry.exerciseId, {
                    weightKg: lastSet?.weightKg ?? 20,
                    reps: lastSet?.reps ?? 8,
                    note: "",
                    pre: lastSet?.pre,
                    completed: false,
                  }),
                );
                setMessage("");
              }}
              onRemoveExercise={() => {
                setDraft((current) =>
                  removeExerciseFromDraft(current, entry.exerciseId),
                );
                setMessage("");
              }}
              onRemoveSet={(setNumber) => {
                setDraft((current) =>
                  removeDraftSet(current, entry.exerciseId, setNumber),
                );
                setMessage("");
              }}
              onUpdateSet={(setNumber, set) => {
                setDraft((current) =>
                  updateDraftSet(current, entry.exerciseId, setNumber, set),
                );
                setMessage("");
              }}
            />
          ))
        )}
      </section>

      <div className="mt-5 space-y-3">
        {message ? (
          <p className="rounded-md bg-[#1d2a14] px-4 py-3 text-sm font-bold text-[#B6FF3B]">
            {message}
          </p>
        ) : null}
        {!canSave ? (
          <p className="text-center text-xs font-bold text-zinc-400">
            请输入训练名称，并至少添加一个训练动作后保存。
          </p>
        ) : null}
        <PrimaryButton
          className="w-full"
          disabled={!canSave}
          onClick={() => {
            if (!canSave) {
              return;
            }

            saveSession(completeDraftWorkout(draft));
            router.push("/history");
          }}
        >
          保存训练
        </PrimaryButton>
      </div>
    </div>
  );
}

function ExercisePicker({
  groups,
  activeCategory,
  onCategoryChange,
  onAddExercise,
}: {
  groups: ExerciseSelectionGroup[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onAddExercise: (exerciseId: string) => void;
}) {
  const activeGroup =
    groups.find(
      (group) => group.category === activeCategory && group.exercises.length > 0,
    ) ??
    groups.find((group) => group.exercises.length > 0) ??
    groups[0];

  return (
    <div className="grid grid-cols-[5.75rem_1fr] gap-3">
      <div className="space-y-2">
        {groups.map((group) => {
          const active = group.category === activeGroup.category;

          return (
            <button
              className={`min-h-12 w-full rounded-md px-2 text-sm font-black transition ${
                active
                  ? "bg-[#B6FF3B] text-[#0B0F14]"
                  : "bg-zinc-100 text-zinc-500"
              }`}
              key={group.category}
              onClick={() => onCategoryChange(group.category)}
              type="button"
            >
              <span className="block">{group.category}</span>
              <span className="mt-1 block text-[0.68rem] font-bold opacity-70">
                {group.exercises.length}
              </span>
            </button>
          );
        })}
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto rounded-md bg-zinc-50 p-2">
        {activeGroup.exercises.length === 0 ? (
          <p className="px-2 py-5 text-center text-sm font-semibold text-zinc-400">
            这个分类下暂无可添加动作。
          </p>
        ) : (
          activeGroup.exercises.map((exercise) => (
            <button
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-3 text-left transition hover:border-[#B6FF3B] hover:bg-[#111820]"
              key={exercise.id}
              onClick={() => onAddExercise(exercise.id)}
              type="button"
            >
              <span className="block text-base font-black leading-6 text-zinc-950">
                {exercise.name}
              </span>
              <span className="mt-1 block text-xs font-bold leading-5 text-zinc-500">
                {exercise.targetMuscles.join("、") || exercise.category}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function CustomExerciseForm({
  onCreate,
}: {
  onCreate: (input: {
    name: string;
    category: string;
    targetMuscles: string[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [targetMuscle, setTargetMuscle] = useState("");
  const canSubmit = name.trim().length > 0;

  return (
    <form
      className="mt-4 space-y-2 border-t border-zinc-100 pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }

        onCreate({
          name,
          category,
          targetMuscles: [targetMuscle.trim() || "自定义"],
        });
        setName("");
        setCategory("");
        setTargetMuscle("");
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
        自定义动作
      </p>
      <TextInput
        onChange={(event) => setName(event.target.value)}
        placeholder="动作名称，例如 坐姿器械划船"
        value={name}
      />
      <div className="grid grid-cols-2 gap-2">
        <TextInput
          onChange={(event) => setCategory(event.target.value)}
          placeholder="肌群"
          value={category}
        />
        <TextInput
          onChange={(event) => setTargetMuscle(event.target.value)}
          placeholder="类型"
          value={targetMuscle}
        />
      </div>
      <SecondaryButton className="w-full" disabled={!canSubmit} type="submit">
        新建并加入训练
      </SecondaryButton>
    </form>
  );
}

function WorkoutEntryEditor({
  entry,
  exerciseName,
  onAddSet,
  onRemoveExercise,
  onRemoveSet,
  onUpdateSet,
}: {
  entry: WorkoutEntry;
  exerciseName: string;
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onRemoveSet: (setNumber: number) => void;
  onUpdateSet: (
    setNumber: number,
    set: Omit<WorkoutSet, "setNumber">,
  ) => void;
}) {
  const [openNotes, setOpenNotes] = useState<Record<number, boolean>>({});
  const [openPrePickers, setOpenPrePickers] = useState<Record<number, boolean>>({});

  return (
    <article className="rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-zinc-950">{exerciseName}</h2>
          <p className="mt-1 text-xs font-bold text-zinc-500">
            {summarizeEntry(entry)}
          </p>
        </div>
        <button
          className="min-h-9 rounded-md bg-[#ffe9eb] px-3 text-xs font-bold text-[#a62735]"
          onClick={onRemoveExercise}
          type="button"
        >
          删除动作
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {entry.sets.map((set) => (
          <div className="border-t border-zinc-100 pt-3" key={set.setNumber}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-black text-zinc-950">
                第 {set.setNumber} 组
              </p>
              <button
                className="min-h-8 rounded-md px-2 text-xs font-bold text-zinc-500"
                onClick={() => onRemoveSet(set.setNumber)}
                type="button"
              >
                删除
              </button>
            </div>
            <div className="grid grid-cols-[1fr_1fr_3.25rem] gap-2">
              <label>
                <span className="mb-1 block text-xs font-bold text-zinc-500">
                  重量 kg
                </span>
                <StepperInput
                  ariaLabel="重量 kg"
                  inputMode="decimal"
                  onChange={(value) =>
                    onUpdateSet(set.setNumber, {
                      weightKg: value,
                      reps: set.reps,
                      note: set.note,
                      pre: set.pre,
                      completed: set.completed,
                    })
                  }
                  step={5}
                  value={set.weightKg}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-zinc-500">
                  次数 reps
                </span>
                <StepperInput
                  ariaLabel="次数 reps"
                  inputMode="numeric"
                  onChange={(value) =>
                    onUpdateSet(set.setNumber, {
                      weightKg: set.weightKg,
                      reps: value,
                      note: set.note,
                      pre: set.pre,
                      completed: set.completed,
                    })
                  }
                  step={1}
                  value={set.reps}
                />
              </label>
              <label
                aria-label="已完成"
                className="flex flex-col items-center justify-end gap-1"
              >
                <span className="text-xs font-bold text-zinc-500">完成</span>
                <span className="flex min-h-12 w-full items-center justify-center rounded-md bg-zinc-50">
                  <input
                    checked={set.completed}
                    className="h-8 w-8 accent-[#B6FF3B]"
                    onChange={(event) =>
                      onUpdateSet(set.setNumber, {
                        weightKg: set.weightKg,
                        reps: set.reps,
                        note: set.note,
                        pre: set.pre,
                        completed: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                </span>
              </label>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                aria-expanded={openNotes[set.setNumber] ? "true" : "false"}
                className="min-h-10 rounded-md bg-white/18 px-3 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-xl"
                onClick={() => {
                  setOpenPrePickers((current) => ({
                    ...current,
                    [set.setNumber]: false,
                  }));
                  setOpenNotes((current) => ({
                    ...current,
                    [set.setNumber]: !current[set.setNumber],
                  }));
                }}
                type="button"
              >
                {set.note ? "查看备注" : "备注"}
              </button>
              <button
                aria-expanded={openPrePickers[set.setNumber] ? "true" : "false"}
                className={`min-h-10 rounded-md px-3 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-xl ${
                  set.pre
                    ? "bg-white/28 text-white"
                    : "bg-white/18 text-white/78"
                }`}
                onClick={() => {
                  setOpenNotes((current) => ({
                    ...current,
                    [set.setNumber]: false,
                  }));
                  setOpenPrePickers((current) => ({
                    ...current,
                    [set.setNumber]: !current[set.setNumber],
                  }));
                }}
                type="button"
              >
                {set.pre ? `PRE ${set.pre}` : "PRE"}
              </button>
            </div>
            {set.note ? (
              <p className="mt-2 rounded-md bg-white/10 px-3 py-2 text-xs font-semibold leading-5 text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl">
                {set.note}
              </p>
            ) : null}
            {openPrePickers[set.setNumber] ? (
              <PreWheel
                onSelect={(pre) => {
                  onUpdateSet(set.setNumber, {
                    weightKg: set.weightKg,
                    reps: set.reps,
                    note: set.note,
                    pre,
                    completed: set.completed,
                  });
                }}
                value={set.pre}
              />
            ) : null}
            {openNotes[set.setNumber] ? (
              <TextArea
                className="mt-2"
                onChange={(event) =>
                  onUpdateSet(set.setNumber, {
                    weightKg: set.weightKg,
                    reps: set.reps,
                    note: event.target.value,
                    pre: set.pre,
                    completed: set.completed,
                  })
                }
                placeholder="例如 动作稳定、最后两次吃力"
                value={set.note}
              />
            ) : null}
          </div>
        ))}
      </div>

      <SecondaryButton className="mt-4 w-full" onClick={onAddSet} type="button">
        新增一组
      </SecondaryButton>
    </article>
  );
}

function StepperInput({
  ariaLabel,
  inputMode,
  value,
  step,
  onChange,
}: {
  ariaLabel: string;
  inputMode: "decimal" | "numeric";
  value: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const pattern = inputMode === "decimal" ? "[0-9]*[.]?[0-9]*" : "[0-9]*";

  return (
    <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-stretch gap-1">
      <button
        aria-label={`${ariaLabel} 减少`}
        className="min-h-12 rounded-md bg-white/18 text-lg font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl"
        onClick={() => onChange(adjustWorkoutSetValue(value, -step))}
        type="button"
      >
        -
      </button>
      <TextInput
        aria-label={ariaLabel}
        className="px-2 text-center"
        inputMode={inputMode}
        onClick={(event) => event.currentTarget.select()}
        onChange={(event) => onChange(Number(event.target.value))}
        onFocus={(event) => event.currentTarget.select()}
        pattern={pattern}
        type="text"
        value={value}
      />
      <button
        aria-label={`${ariaLabel} 增加`}
        className="min-h-12 rounded-md bg-white/18 text-lg font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl"
        onClick={() => onChange(adjustWorkoutSetValue(value, step))}
        type="button"
      >
        +
      </button>
    </div>
  );
}

function PreWheel({
  value,
  onSelect,
}: {
  value?: number;
  onSelect: (value?: number) => void;
}) {
  const sliderValue = value ?? preScaleMin;
  const percent = getPreSliderPercent(sliderValue);

  return (
    <div className="mt-3 rounded-md border border-white/18 bg-white/12 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_18px_42px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-black text-white">
          {value === undefined ? "选择 PRE" : `PRE ${value.toFixed(1)}`}
        </span>
        <button
          className="min-h-8 rounded-md bg-white/18 px-3 text-xs font-black text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] disabled:opacity-40"
          disabled={value === undefined}
          onClick={() => onSelect(undefined)}
          type="button"
        >
          取消
        </button>
      </div>
      <div
        className="pre-slider-shell"
        style={{ "--pre-progress": `${percent}%` } as CSSProperties}
      >
        <input
          aria-label="PRE 数值"
          className="pre-slider"
          max={preScaleMax}
          min={preScaleMin}
          onChange={(event) => onSelect(Number(event.target.value))}
          step={preScaleStep}
          type="range"
          value={sliderValue}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs font-bold text-zinc-500">
        <span>{preScaleMin.toFixed(1)}</span>
        <span>{preScaleMax.toFixed(1)}</span>
      </div>
    </div>
  );
}

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}
