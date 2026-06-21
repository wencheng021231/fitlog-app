"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { createDraftFromPreviousWorkout } from "../domain";
import { savePendingWorkoutDraft } from "../draft-storage";
import {
  formatDate,
} from "../format";
import { useFitnessStore } from "../use-fitness-store";
import type { WorkoutSession } from "../types";
import {
  EmptyState,
  Metric,
  PageHeader,
  SecondaryButton,
  SectionTitle,
} from "../components/ui";

export function HistoryPage() {
  const router = useRouter();
  const { sessions, deleteSession } = useFitnessStore();
  const completedSessions = sessions
    .filter((session) => session.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date) || b.startedAt.localeCompare(a.startedAt));
  const groupedSessions = useMemo(
    () => groupSessionsByDate(completedSessions),
    [completedSessions],
  );
  const totalSets = completedSessions.reduce(
    (total, session) => total + session.totalSets,
    0,
  );
  const totalVolume = completedSessions.reduce(
    (total, session) => total + session.totalVolumeKg,
    0,
  );
  const latestSession = completedSessions[0];

  return (
    <div>
      <PageHeader
        description="按日期查看训练记录，点击记录卡片查看动作和每组详情。"
        eyebrow="历史"
        title="训练记录"
      />

      <section className="mb-6 grid grid-cols-3 gap-2">
        <Metric label="训练" tone="gold" value={`${completedSessions.length}`} />
        <Metric label="完成组" tone="blue" value={`${totalSets}`} />
        <Metric label="容量" tone="green" value={`${Math.round(totalVolume)}kg`} />
      </section>

      <SecondaryButton
        className="mb-5 w-full"
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

      <section>
        <SectionTitle title="按日期查看" tone="light" />
        {completedSessions.length === 0 ? (
          <EmptyState>还没有历史训练，请先完成一次训练。</EmptyState>
        ) : (
          <div className="space-y-6">
            {groupedSessions.map((group) => (
              <div key={group.date}>
                <h2 className="mb-2 text-sm font-black text-zinc-500">
                  {formatDate(group.date)}
                </h2>
                <div className="space-y-3">
                  {group.sessions.map((session) => {
                    return (
                      <article
                        className="overflow-hidden rounded-md border border-zinc-100 bg-white shadow-sm"
                        key={session.id}
                      >
                        <button
                          className="block w-full p-4 text-left"
                          onClick={() =>
                            router.push(
                              `/history/${encodeURIComponent(session.id)}`,
                            )
                          }
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B6FF3B]">
                                {session.date}
                              </p>
                              <h3 className="mt-1 text-xl font-black text-zinc-950">
                                {session.planName}
                              </h3>
                              <p className="mt-2 text-sm font-semibold text-zinc-500">
                                {session.entries.length} 个动作 ·{" "}
                                {session.totalSets} 组完成 · 总容量{" "}
                                {Math.round(session.totalVolumeKg)}kg
                              </p>
                              {session.note ? (
                                <p className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
                                  {session.note}
                                </p>
                              ) : null}
                            </div>
                            <span className="rounded-md bg-[#ffe9eb] px-2 py-1 text-xs font-bold text-[#a62735]">
                              详情
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <div className="rounded-md bg-zinc-50 px-3 py-2">
                              <p className="text-xs font-bold text-zinc-500">
                                动作数
                              </p>
                              <p className="mt-1 text-lg font-black text-zinc-950">
                                {session.entries.length}
                              </p>
                            </div>
                            <div className="rounded-md bg-zinc-50 px-3 py-2">
                              <p className="text-xs font-bold text-zinc-500">
                                总组数
                              </p>
                              <p className="mt-1 text-lg font-black text-zinc-950">
                                {session.totalSets}
                              </p>
                            </div>
                            <div className="rounded-md bg-zinc-50 px-3 py-2">
                              <p className="text-xs font-bold text-zinc-500">
                                容量
                              </p>
                              <p className="mt-1 text-lg font-black text-zinc-950">
                                {Math.round(session.totalVolumeKg)}
                              </p>
                            </div>
                          </div>
                        </button>
                        <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-zinc-100 px-4 py-3">
                          <Link
                            className="flex min-h-11 items-center justify-center rounded-md bg-[#B6FF3B] px-4 text-sm font-black text-[#0B0F14]"
                            href={`/history/${encodeURIComponent(session.id)}`}
                          >
                            进入详情
                          </Link>
                          <button
                            className="min-h-11 rounded-md border border-[#7f1d2a] bg-[#2a0f12] px-4 text-sm font-black text-[#ff6b77]"
                            onClick={() => {
                              if (!window.confirm("确定删除这条训练记录吗？")) {
                                return;
                              }

                              deleteSession(session.id);
                            }}
                            type="button"
                          >
                            删除
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
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

function groupSessionsByDate(sessions: WorkoutSession[]) {
  const groups = new Map<string, WorkoutSession[]>();

  sessions.forEach((session) => {
    groups.set(session.date, [...(groups.get(session.date) ?? []), session]);
  });

  return Array.from(groups.entries()).map(([date, groupSessions]) => ({
    date,
    sessions: groupSessions,
  }));
}
