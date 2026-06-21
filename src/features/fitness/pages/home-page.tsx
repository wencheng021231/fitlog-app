"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  createDraftFromPreviousWorkout,
  getDashboardMetrics,
  getTodayPlan,
} from "../domain";
import { savePendingWorkoutDraft } from "../draft-storage";
import {
  formatDate,
  formatDateTime,
  formatWeekDays,
  getExerciseName,
  summarizeEntry,
} from "../format";
import { useFitnessStore } from "../use-fitness-store";
import {
  EmptyState,
  Metric,
  PageHeader,
  SecondaryButton,
  SectionTitle,
} from "../components/ui";

export function HomePage() {
  const router = useRouter();
  const { plans, sessions, exerciseById } = useFitnessStore();
  const todayPlan = getTodayPlan(plans);
  const metrics = getDashboardMetrics(sessions);
  const completedSessions = sessions
    .filter((session) => session.status === "completed")
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.startedAt.localeCompare(a.startedAt),
    );
  const latestSession = completedSessions[0];
  const totalVolume = completedSessions.reduce(
    (total, session) => total + session.totalVolumeKg,
    0,
  );
  const mostTrainedExercise = metrics.mostTrainedExerciseId
    ? getExerciseName(exerciseById, metrics.mostTrainedExerciseId)
    : "暂无";

  return (
    <div>
      <PageHeader
        description="查看今日训练、最近训练和本周训练次数，快速进入训练记录。"
        eyebrow="首页"
        title="训练首页"
      />

      <section className="mb-5 rounded-md bg-[#111111] p-5 text-white shadow-sm ring-1 ring-[#2a0f12]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#B6FF3B]">查看今日训练</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">
              {todayPlan?.name ?? "自由训练"}
            </h2>
          </div>
          <span className="shrink-0 rounded-md bg-[#1d2a14] px-2 py-1 text-xs font-bold text-[#B6FF3B]">
            {todayPlan ? formatWeekDays(todayPlan.scheduledDays) : "今天"}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-zinc-300">
          {todayPlan?.focus ?? "选择动作，自动生成 3 组，直接开始记录。"}
        </p>

        {todayPlan ? (
          <>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              {todayPlan.exercises.map((exercise) => (
                <div
                  className="flex items-center justify-between rounded-md bg-white/8 px-3 py-2 text-sm"
                  key={exercise.exerciseId}
                >
                  <span className="font-semibold">
                    {getExerciseName(exerciseById, exercise.exerciseId)}
                  </span>
                  <span className="text-zinc-300">
                    {exercise.targetSets} × {exercise.targetReps}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-md bg-white/8 px-3 py-3 text-sm font-semibold text-zinc-300">
            还没有训练计划，也可以先做一次自由训练。
          </p>
        )}

        <Link
          className="mt-5 flex min-h-14 items-center justify-center rounded-md bg-[#B6FF3B] px-5 text-base font-black text-[#0B0F14] shadow-sm transition hover:bg-[#C8FF62]"
          href="/workout/new"
        >
          开始训练
        </Link>
        <SecondaryButton
          className="mt-3 w-full border-[#4b171d] bg-[#1a1a1a] text-white hover:bg-[#2a0f12] disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
          disabled={!latestSession}
          onClick={() => {
            if (!latestSession) {
              return;
            }

            savePendingWorkoutDraft(
              createDraftFromPreviousWorkout(latestSession, getTodayInputValue()),
            );
            router.push("/workout/new");
          }}
          type="button"
        >
          复制上次训练
        </SecondaryButton>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-2">
        <Metric
          label="本周训练次数"
          tone="green"
          value={`${metrics.weeklyWorkoutCount}`}
        />
        <Metric label="总训练次数" tone="gold" value={`${metrics.totalWorkoutCount}`} />
        <Metric label="最常练动作" tone="blue" value={mostTrainedExercise} />
        <Metric label="总容量" tone="red" value={`${Math.round(totalVolume)}kg`} />
      </section>

      <section className="mb-6">
        <SectionTitle
          aside={
            <Link className="text-sm font-bold text-[#B6FF3B]" href="/history">
              查看全部
            </Link>
          }
          tone="light"
          title="最近训练"
        />
        {latestSession ? (
          <article className="rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-500">
                  {formatDate(latestSession.date)}
                </p>
                <h3 className="mt-1 text-xl font-black text-zinc-950">
                  {latestSession.planName}
                </h3>
              </div>
              <span className="rounded-md bg-[#ffe9eb] px-2 py-1 text-xs font-bold text-[#a62735]">
                {Math.round(latestSession.totalVolumeKg)}kg
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-md bg-zinc-50 px-3 py-2">
                <p className="text-xs font-bold text-zinc-500">动作</p>
                <p className="mt-1 text-lg font-black text-zinc-950">
                  {latestSession.entries.length}
                </p>
              </div>
              <div className="rounded-md bg-zinc-50 px-3 py-2">
                <p className="text-xs font-bold text-zinc-500">完成组</p>
                <p className="mt-1 text-lg font-black text-zinc-950">
                  {latestSession.totalSets}
                </p>
              </div>
              <div className="rounded-md bg-zinc-50 px-3 py-2">
                <p className="text-xs font-bold text-zinc-500">保存</p>
                <p className="mt-1 text-sm font-black text-zinc-950">
                  {formatDateTime(latestSession.completedAt).split(" ")[1]}
                </p>
              </div>
            </div>
            {latestSession.note ? (
              <p className="mt-3 rounded-md bg-[#ffe9eb] px-3 py-2 text-sm font-semibold leading-6 text-[#a62735]">
                {latestSession.note}
              </p>
            ) : null}
            <div className="mt-4 space-y-2">
              {latestSession.entries.slice(0, 2).map((entry) => (
                <p className="text-sm text-zinc-600" key={entry.exerciseId}>
                  <span className="font-bold text-zinc-950">
                    {getExerciseName(
                      exerciseById,
                      entry.exerciseId,
                      entry.exerciseName,
                    )}
                  </span>
                  ：{summarizeEntry(entry)}
                </p>
              ))}
            </div>
          </article>
        ) : (
          <EmptyState>还没有历史训练，完成一次训练后会显示在这里。</EmptyState>
        )}
      </section>

      <section>
        <SectionTitle title="快捷入口" tone="light" />
        <div className="grid grid-cols-2 gap-2">
          <Link
            className="rounded-md border border-zinc-100 bg-white p-4 text-sm font-black text-zinc-950 shadow-sm"
            href="/workout/new"
          >
            开始训练
          </Link>
          <Link
            className="rounded-md border border-zinc-100 bg-white p-4 text-sm font-black text-zinc-950 shadow-sm"
            href="/exercises"
          >
            动作库
          </Link>
          <Link
            className="rounded-md border border-zinc-100 bg-white p-4 text-sm font-black text-zinc-950 shadow-sm"
            href="/history"
          >
            查看历史记录
          </Link>
          <Link
            className="rounded-md border border-zinc-100 bg-white p-4 text-sm font-black text-zinc-950 shadow-sm"
            href="/profile"
          >
            我的设置
          </Link>
        </div>
      </section>
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
