"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createDraftWorkoutFromPlan } from "../domain";
import { savePendingWorkoutDraft } from "../draft-storage";
import { formatWeekDays, getExerciseName, weekDays } from "../format";
import { trainingTemplates } from "../mock-data";
import { useFitnessStore } from "../use-fitness-store";
import type {
  Exercise,
  PlannedExercise,
  TrainingTemplate,
  WorkoutPlan,
} from "../types";
import {
  EmptyState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  SelectInput,
  TextInput,
} from "../components/ui";

export function PlansPage() {
  const router = useRouter();
  const {
    plans,
    exercises,
    exerciseById,
    addPlan,
    addPlanFromTemplate,
    addExerciseToExistingPlan,
    restoreDemoData,
  } = useFitnessStore();
  const startPlan = (plan: WorkoutPlan) => {
    savePendingWorkoutDraft(createDraftWorkoutFromPlan(plan, getTodayInputValue()));
    router.push("/workout/new");
  };

  return (
    <div>
      <PageHeader
        action={
          <SecondaryButton className="px-3 text-xs" onClick={restoreDemoData}>
            重置
          </SecondaryButton>
        }
        description="创建训练计划，并把动作、目标组数和目标次数放进计划。"
        eyebrow="计划"
        title="训练计划"
      />

      <TemplateSection
        exerciseById={exerciseById}
        onUseTemplate={(template) => {
          const plan = addPlanFromTemplate(template);
          startPlan(plan);
        }}
        templates={trainingTemplates}
      />

      <CreatePlanForm exercises={exercises} onCreate={addPlan} />

      <section className="mt-7">
        <SectionTitle title="已有计划" tone="light" />
        <div className="space-y-3">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <article
                className="rounded-md border border-zinc-100 bg-white p-4 shadow-sm"
                key={plan.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-zinc-950">
                      {plan.name}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-zinc-500">
                      {plan.focus}
                    </p>
                  </div>
                  <span className="rounded-md bg-[#ffe9eb] px-2 py-1 text-xs font-bold text-[#a62735]">
                    {formatWeekDays(plan.scheduledDays)}
                  </span>
                </div>

                <div className="mt-4 divide-y divide-zinc-100">
                  {plan.exercises.map((exercise) => (
                    <div
                      className="flex items-center justify-between gap-3 py-3"
                      key={exercise.exerciseId}
                    >
                      <div>
                        <p className="text-sm font-black text-zinc-950">
                          {getExerciseName(exerciseById, exercise.exerciseId)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-zinc-500">
                          休息 {exercise.restSeconds}s
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-black text-zinc-700">
                        {exercise.targetSets} × {exercise.targetReps}
                      </p>
                    </div>
                  ))}
                </div>

                <PlanExerciseAdder
                  exercises={exercises}
                  onAdd={(plannedExercise) =>
                    addExerciseToExistingPlan(plan.id, plannedExercise)
                  }
                  plan={plan}
                />
                <SecondaryButton
                  className="mt-3 w-full"
                  onClick={() => startPlan(plan)}
                  type="button"
                >
                  用此计划开始训练
                </SecondaryButton>
              </article>
            ))
          ) : (
            <EmptyState>还没有计划，请先创建一个训练计划。</EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}

function TemplateSection({
  templates,
  exerciseById,
  onUseTemplate,
}: {
  templates: TrainingTemplate[];
  exerciseById: Map<string, Exercise>;
  onUseTemplate: (template: TrainingTemplate) => void;
}) {
  return (
    <section className="mb-7">
      <SectionTitle
        aside={
          <span className="text-sm font-bold text-zinc-400">
            {templates.length} 个模板
          </span>
        }
        title="训练模板"
        tone="light"
      />
      <div className="space-y-3">
        {templates.map((template) => (
          <article
            className="rounded-md border border-[#252525] bg-[#141414] p-4 shadow-sm"
            key={template.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">
                  {template.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-zinc-400">
                  {template.focus}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-[#1d2a14] px-2 py-1 text-xs font-bold text-[#B6FF3B]">
                {template.exercises.length} 动作
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {template.exercises.map((exercise) => (
                <div
                  className="rounded-md bg-[#1f1f22] px-3 py-2"
                  key={exercise.exerciseId}
                >
                  <p className="text-sm font-black leading-5 text-white">
                    {exerciseById.get(exercise.exerciseId)?.name ?? "未知动作"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-zinc-400">
                    3 × {exercise.targetReps}
                  </p>
                </div>
              ))}
            </div>
            <PrimaryButton
              className="mt-4 w-full"
              onClick={() => onUseTemplate(template)}
              type="button"
            >
              使用模板并开始
            </PrimaryButton>
          </article>
        ))}
      </div>
    </section>
  );
}

function CreatePlanForm({
  exercises,
  onCreate,
}: {
  exercises: { id: string; name: string }[];
  onCreate: (input: {
    name: string;
    focus: string;
    scheduledDays: number[];
    firstExercise: PlannedExercise;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [scheduledDays, setScheduledDays] = useState<number[]>([1, 3, 5]);
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [targetSets, setTargetSets] = useState(4);
  const [targetReps, setTargetReps] = useState(8);

  const canSubmit = name.trim() && exerciseId;

  return (
    <section className="rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
      <SectionTitle title="创建计划" />
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) {
            return;
          }

          onCreate({
            name,
            focus,
            scheduledDays,
            firstExercise: {
              exerciseId,
              targetSets,
              targetReps,
              restSeconds: 90,
            },
          });
          setName("");
          setFocus("");
        }}
      >
        <TextInput
          onChange={(event) => setName(event.target.value)}
          placeholder="计划名称，例如 推力训练"
          value={name}
        />
        <TextInput
          onChange={(event) => setFocus(event.target.value)}
          placeholder="训练重点，例如 胸肩三头"
          value={focus}
        />
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const active = scheduledDays.includes(day.value);

            return (
              <button
                className={`h-10 rounded-md text-[0.68rem] font-bold transition ${
                  active
                    ? "bg-[#B6FF3B] text-[#0B0F14]"
                    : "bg-zinc-100 text-zinc-500"
                }`}
                key={day.value}
                onClick={() => {
                  setScheduledDays((current) =>
                    active
                      ? current.filter((item) => item !== day.value)
                      : [...current, day.value].sort(),
                  );
                }}
                type="button"
              >
                {day.label.replace("周", "")}
              </button>
            );
          })}
        </div>
        <SelectInput
          onChange={(event) => setExerciseId(event.target.value)}
          value={exerciseId}
        >
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </SelectInput>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="目标组数"
            min={1}
            onChange={setTargetSets}
            value={targetSets}
          />
          <NumberField
            label="目标次数"
            min={1}
            onChange={setTargetReps}
            value={targetReps}
          />
        </div>
        <PrimaryButton className="w-full" disabled={!canSubmit} type="submit">
          创建计划
        </PrimaryButton>
      </form>
    </section>
  );
}

function PlanExerciseAdder({
  plan,
  exercises,
  onAdd,
}: {
  plan: WorkoutPlan;
  exercises: { id: string; name: string }[];
  onAdd: (exercise: PlannedExercise) => void;
}) {
  const availableExercises = exercises.filter(
    (exercise) => !plan.exercises.some((item) => item.exerciseId === exercise.id),
  );
  const [exerciseId, setExerciseId] = useState(availableExercises[0]?.id ?? "");
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);

  if (availableExercises.length === 0) {
    return (
      <p className="mt-3 rounded-md bg-zinc-50 px-3 py-3 text-sm font-semibold text-zinc-500">
        动作库里的动作都已经加入这个计划。
      </p>
    );
  }

  const selectedExerciseId =
    availableExercises.some((exercise) => exercise.id === exerciseId)
      ? exerciseId
      : availableExercises[0].id;

  return (
    <form
      className="mt-4 space-y-2 border-t border-zinc-100 pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd({
          exerciseId: selectedExerciseId,
          targetSets,
          targetReps,
          restSeconds: 90,
        });
        const next = availableExercises.find(
          (exercise) => exercise.id !== selectedExerciseId,
        );
        setExerciseId(next?.id ?? "");
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
        添加动作
      </p>
      <SelectInput
        onChange={(event) => setExerciseId(event.target.value)}
        value={selectedExerciseId}
      >
        {availableExercises.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
          </option>
        ))}
      </SelectInput>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="组数"
          min={1}
          onChange={setTargetSets}
          value={targetSets}
        />
        <NumberField
          label="次数"
          min={1}
          onChange={setTargetReps}
          value={targetReps}
        />
      </div>
      <SecondaryButton className="w-full" type="submit">
        添加到计划
      </SecondaryButton>
    </form>
  );
}

function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-zinc-500">{label}</span>
      <TextInput
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}
