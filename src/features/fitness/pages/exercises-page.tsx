"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { isCustomExercise } from "../domain";
import type { Exercise } from "../types";
import { useFitnessStore } from "../use-fitness-store";
import {
  EmptyState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  SectionTitle,
  TextInput,
} from "../components/ui";

const muscleOptions = [
  { label: "胸", value: "胸部" },
  { label: "背", value: "背部" },
  { label: "腿", value: "腿部" },
  { label: "肩", value: "肩部" },
  { label: "手臂", value: "手臂" },
  { label: "核心", value: "腹部" },
  { label: "其他", value: "其他" },
];

const equipmentOptions = ["杠铃", "哑铃", "固定器械", "自重", "绳索", "其他"];

type ExerciseFormValue = {
  name: string;
  category: string;
  equipment: string;
};

export function ExercisesPage() {
  const { exercises, addExercise, updateExercise, deleteExercise } =
    useFitnessStore();
  const [activeCategory, setActiveCategory] = useState("全部");
  const [keyword, setKeyword] = useState("");
  const [editingExercise, setEditingExercise] = useState<
    (ExerciseFormValue & { id: string }) | null
  >(null);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(exercises.map((item) => item.category)))],
    [exercises],
  );
  const currentActiveCategory = categories.includes(activeCategory)
    ? activeCategory
    : "全部";
  const visibleExercises = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        [exercise.name, exercise.category, ...exercise.targetMuscles]
          .concat(exercise.equipment ?? "")
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return matchesKeyword;
    });
  }, [exercises, keyword]);
  const groupedExercises = useMemo(() => {
    return visibleExercises.reduce<
      Record<string, Record<string, typeof visibleExercises>>
    >((groups, exercise) => {
      const category = exercise.category || "未分类";
      const section = exercise.targetMuscles[0] || "未设置";

      groups[category] ??= {};
      groups[category][section] ??= [];
      groups[category][section].push(exercise);

      return groups;
    }, {});
  }, [visibleExercises]);
  const categoryEntries = useMemo(
    () =>
      categories
        .filter((category) => category !== "全部")
        .map((category) => [category, groupedExercises[category]] as const)
        .filter(([, sections]) => sections !== undefined),
    [categories, groupedExercises],
  );

  useEffect(() => {
    const nodes = categoryEntries
      .map(([category]) => categoryRefs.current[category])
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              first.boundingClientRect.top - second.boundingClientRect.top,
          )[0];
        const category = visibleEntry?.target.getAttribute("data-category");

        if (category) {
          setActiveCategory(category);
        }
      },
      {
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0, 0.1, 0.4],
      },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [categoryEntries]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);

    if (category === "全部") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    categoryRefs.current[category]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div>
      <PageHeader
        description="查看动作，按肌群分类浏览，也可以添加自定义动作。"
        eyebrow="动作库"
        title="动作库"
      />

      <section className="mb-5 space-y-3">
        <TextInput
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索动作、肌群或器械类型"
          value={keyword}
        />
      </section>

      <CreateExerciseForm onCreate={addExercise} />

      <section>
        <SectionTitle
          aside={
            <span className="text-sm font-bold text-zinc-300">
              {visibleExercises.length} 个动作
            </span>
          }
          tone="light"
          title="查看动作"
        />
        {exercises.length === 0 ? (
          <EmptyState>动作库为空，请先添加一个动作。</EmptyState>
        ) : visibleExercises.length === 0 ? (
          <EmptyState>没有匹配的动作，换个关键词或分类试试。</EmptyState>
        ) : (
          <div className="grid grid-cols-[5.1rem_1fr] items-start gap-3">
            <aside className="sticky top-4 max-h-[calc(100dvh-7rem)] space-y-2.5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => {
                const active = category === currentActiveCategory;
                const count =
                  category === "全部"
                    ? visibleExercises.length
                    : Object.values(groupedExercises[category] ?? {}).reduce(
                        (total, items) => total + items.length,
                        0,
                      );

                return (
                  <button
                    className={`min-h-12 w-full rounded-[1.6rem] px-2.5 py-2 text-center text-[0.78rem] font-black leading-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.36),0_10px_26px_rgba(2,6,23,0.16)] backdrop-blur-2xl transition ${
                      active
                        ? "bg-white/38 text-white ring-1 ring-white/42"
                        : "bg-white/16 text-white/74 ring-1 ring-white/18"
                    }`}
                    key={category}
                    onClick={() => scrollToCategory(category)}
                    type="button"
                  >
                    <span className="block [overflow-wrap:anywhere]">
                      {category}
                    </span>
                    <span className="mt-1 block text-[0.65rem] font-bold opacity-70">
                      {count}
                    </span>
                  </button>
                );
              })}
            </aside>
            <div className="min-w-0 space-y-5">
              {categoryEntries.map(([category, sections]) => (
                <div
                  data-category={category}
                  key={category}
                  ref={(node) => {
                    categoryRefs.current[category] = node;
                  }}
                  className="scroll-mt-4"
                >
                  <h2 className="mb-3 text-lg font-black text-white">
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {Object.entries(sections).map(([section, items]) => (
                      <div
                        className="rounded-md border border-zinc-100 bg-white p-4 shadow-sm"
                        key={section}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl">
                            {section}
                          </h3>
                          <span className="rounded-full bg-white/16 px-2.5 py-1 text-xs font-bold text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl">
                            {items.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {items.map((exercise) => (
                            <ExerciseCard
                              editingExercise={editingExercise}
                              exercise={exercise}
                              key={exercise.id}
                              onCancelEdit={() => setEditingExercise(null)}
                              onDelete={(exerciseId) => {
                                if (
                                  !window.confirm(
                                    `确定删除自定义动作「${exercise.name}」吗？历史训练记录会保留当时的动作名称。`,
                                  )
                                ) {
                                  return;
                                }

                                deleteExercise(exerciseId);
                                if (editingExercise?.id === exerciseId) {
                                  setEditingExercise(null);
                                }
                              }}
                              onEdit={(nextEditingExercise) =>
                                setEditingExercise(nextEditingExercise)
                              }
                              onSave={(exerciseId, input) => {
                                updateExercise(exerciseId, input);
                                setEditingExercise(null);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ExerciseCard({
  exercise,
  editingExercise,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  exercise: Exercise;
  editingExercise: (ExerciseFormValue & { id: string }) | null;
  onEdit: (exercise: ExerciseFormValue & { id: string }) => void;
  onCancelEdit: () => void;
  onSave: (exerciseId: string, input: ExerciseFormValue) => void;
  onDelete: (exerciseId: string) => void;
}) {
  const custom = isCustomExercise(exercise);
  const editing = editingExercise?.id === exercise.id;

  if (editing && editingExercise) {
    return (
      <article className="rounded-md border border-[#B6FF3B]/35 bg-[#111820] px-3 py-3">
        <ExerciseFields
          buttonLabel="保存修改"
          onCancel={onCancelEdit}
          onSubmit={(input) => onSave(exercise.id, input)}
          value={editingExercise}
        />
      </article>
    );
  }

  return (
    <article className="rounded-md bg-[#f8f8f5] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-base font-black leading-6 text-zinc-950">
            {exercise.name}
          </h4>
          <p className="mt-1 text-xs font-bold leading-5 text-zinc-500">
            {exercise.equipment ?? exercise.targetMuscles[0] ?? "未设置"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-black ${
            custom
              ? "bg-[#1d2a14] text-[#B6FF3B]"
              : "bg-zinc-200 text-zinc-600"
          }`}
        >
          {custom ? "自定义" : "内置"}
        </span>
      </div>
      {custom ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <SecondaryButton
            className="min-h-10 px-3 text-xs"
            onClick={() =>
              onEdit({
                id: exercise.id,
                name: exercise.name,
                category: exercise.category || "其他",
                equipment:
                  exercise.equipment ?? exercise.targetMuscles[0] ?? "其他",
              })
            }
            type="button"
          >
            编辑
          </SecondaryButton>
          <button
            className="min-h-10 rounded-md border border-[#7f1d2a] bg-[#2a0f12] px-3 text-xs font-black text-[#ff6b77]"
            onClick={() => onDelete(exercise.id)}
            type="button"
          >
            删除
          </button>
        </div>
      ) : null}
    </article>
  );
}

function CreateExerciseForm({
  onCreate,
}: {
  onCreate: (input: {
    name: string;
    category: string;
    equipment: string;
  }) => void;
}) {
  const [value, setValue] = useState<ExerciseFormValue>({
    name: "",
    category: muscleOptions[0].value,
    equipment: equipmentOptions[0],
  });

  return (
    <section className="mb-5 rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
      <SectionTitle title="新增自定义动作" />
      <ExerciseFields
        buttonLabel="添加动作"
        onSubmit={(input) => {
          onCreate(input);
          setValue({
            name: "",
            category: muscleOptions[0].value,
            equipment: equipmentOptions[0],
          });
        }}
        value={value}
        onValueChange={setValue}
      />
    </section>
  );
}

function ExerciseFields({
  value,
  buttonLabel,
  onSubmit,
  onCancel,
  onValueChange,
}: {
  value: ExerciseFormValue;
  buttonLabel: string;
  onSubmit: (value: ExerciseFormValue) => void;
  onCancel?: () => void;
  onValueChange?: (value: ExerciseFormValue) => void;
}) {
  const [localValue, setLocalValue] = useState(value);
  const fieldValue = onValueChange ? value : localValue;
  const canSubmit = fieldValue.name.trim().length > 0;

  const updateValue = (nextValue: ExerciseFormValue) => {
    if (onValueChange) {
      onValueChange(nextValue);
      return;
    }

    setLocalValue(nextValue);
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }

        onSubmit(fieldValue);
      }}
    >
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-zinc-500">
          动作名称
        </span>
        <TextInput
          aria-label="自定义动作名称"
          onChange={(event) =>
            updateValue({ ...fieldValue, name: event.target.value })
          }
          placeholder="例如 单臂绳索划船"
          value={fieldValue.name}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-500">
            肌群
          </span>
          <SelectInput
            aria-label="选择肌群"
            onChange={(event) =>
              updateValue({ ...fieldValue, category: event.target.value })
            }
            value={fieldValue.category}
          >
            {muscleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-500">
            器械
          </span>
          <SelectInput
            aria-label="选择器械"
            onChange={(event) =>
              updateValue({ ...fieldValue, equipment: event.target.value })
            }
            value={fieldValue.equipment}
          >
            {equipmentOptions.map((equipment) => (
              <option key={equipment} value={equipment}>
                {equipment}
              </option>
            ))}
          </SelectInput>
        </label>
      </div>
      <div className={onCancel ? "grid grid-cols-2 gap-2" : ""}>
        {onCancel ? (
          <SecondaryButton onClick={onCancel} type="button">
            取消
          </SecondaryButton>
        ) : null}
        <PrimaryButton className="w-full" disabled={!canSubmit} type="submit">
          {buttonLabel}
        </PrimaryButton>
      </div>
    </form>
  );
}
