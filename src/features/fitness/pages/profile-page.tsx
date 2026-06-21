"use client";

import { useEffect, useRef, useState } from "react";

import { createBackupFileName } from "../storage-helpers";
import { useFitnessStore } from "../use-fitness-store";
import {
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  SelectInput,
} from "../components/ui";

const WEIGHT_UNIT_KEY = "fitness-plan-app-weight-unit-v1";

export function ProfilePage() {
  const { exercises, plans, sessions, clearUserData, exportData, importData } =
    useFitnessStore();
  const [weightUnit, setWeightUnit] = useState("kg");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setWeightUnit(window.localStorage.getItem(WEIGHT_UNIT_KEY) ?? "kg");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleWeightUnitChange = (value: string) => {
    setWeightUnit(value);
    window.localStorage.setItem(WEIGHT_UNIT_KEY, value);
    setMessage("重量单位已保存。");
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = createBackupFileName();
    anchor.click();
    window.URL.revokeObjectURL(url);
    setMessage("数据已导出为 JSON 文件。");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (file?: File) => {
    if (!file) {
      return;
    }

    const confirmed = window.confirm(
      "导入会合并备份中的自定义动作、训练计划和历史训练；已有同 ID 数据会保留，不会直接覆盖。是否继续？",
    );

    if (!confirmed) {
      return;
    }

    try {
      const rawBackup = await file.text();
      const result = importData(rawBackup);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setMessage(
        `导入完成：新增 ${result.summary.exercises} 个自定义动作、${result.summary.plans} 个计划、${result.summary.sessions} 条历史训练。`,
      );
    } catch {
      setMessage("无法读取备份文件，请重新选择 JSON 文件。");
    }
  };

  const handleClearData = () => {
    const confirmed = window.confirm(
      "确定清空训练计划和历史记录吗？内置动作库会保留。",
    );

    if (!confirmed) {
      return;
    }

    clearUserData();
    setMessage("训练计划和历史记录已清空，内置动作库已保留。");
  };

  return (
    <div>
      <PageHeader
        description="管理基础设置、重量单位、本地数据导出和清空。"
        eyebrow="我的"
        title="我的"
      />

      <section className="mb-5 rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
        <SectionTitle title="基础设置" />
        <div className="grid grid-cols-3 gap-2">
          <ProfileStat label="动作" value={exercises.length} />
          <ProfileStat label="计划" value={plans.length} />
          <ProfileStat
            label="历史"
            value={sessions.filter((session) => session.status === "completed").length}
          />
        </div>
      </section>

      <section className="mb-5 rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
        <SectionTitle title="重量单位" />
        <SelectInput
          aria-label="重量单位"
          onChange={(event) => handleWeightUnitChange(event.target.value)}
          value={weightUnit}
        >
          <option value="kg">kg 公斤</option>
          <option value="lb">lb 磅</option>
        </SelectInput>
      </section>

      <section className="mb-5 rounded-md border border-zinc-100 bg-white p-4 shadow-sm">
        <SectionTitle title="数据管理" />
        <div className="space-y-3">
          <PrimaryButton className="w-full" onClick={handleExport} type="button">
            导出数据
          </PrimaryButton>
          <SecondaryButton className="w-full" onClick={handleImportClick} type="button">
            导入数据
          </SecondaryButton>
          <input
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              void handleImportFile(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
          <SecondaryButton
            className="w-full border-[#7f1d2a] bg-[#2a0f12] text-[#ff6b77]"
            onClick={handleClearData}
            type="button"
          >
            清空数据
          </SecondaryButton>
        </div>
        {message ? (
          <p className="mt-3 rounded-md bg-[#2a0f12] px-3 py-2 text-sm font-bold text-[#ff6b77]">
            {message}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-zinc-50 px-3 py-3">
      <p className="text-xs font-bold text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black text-zinc-950">{value}</p>
    </div>
  );
}
