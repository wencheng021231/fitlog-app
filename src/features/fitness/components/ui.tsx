import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B6FF3B]">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-normal text-white drop-shadow-sm">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/72">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({
  title,
  aside,
  tone = "dark",
}: {
  title: string;
  aside?: ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2
        className={`text-lg font-black ${
          tone === "light" ? "text-white" : "text-zinc-900"
        }`}
      >
        {title}
      </h2>
      {aside}
    </div>
  );
}

export function PrimaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`liquid-button min-h-12 rounded-md px-5 text-sm font-black text-[#0B0F14] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`liquid-button-secondary min-h-12 rounded-md px-5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      {...props}
    />
  );
}

export function TextInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`liquid-input min-h-12 w-full rounded-md px-3 text-base font-semibold outline-none transition placeholder:text-zinc-400 ${className}`}
      {...props}
    />
  );
}

export function SelectInput({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`liquid-input min-h-12 w-full rounded-md px-3 text-base font-semibold outline-none transition ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextArea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`liquid-input min-h-24 w-full resize-none rounded-md px-3 py-3 text-base font-semibold outline-none transition placeholder:text-zinc-400 ${className}`}
      {...props}
    />
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-white/20 bg-white/12 px-4 py-6 text-center text-sm leading-6 text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-2xl">
      {children}
    </div>
  );
}

export function Metric({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: string;
  tone?: "zinc" | "lime" | "sky" | "amber" | "green" | "red" | "blue" | "gold";
}) {
  const tones = {
    zinc: "bg-white/14 text-white border-white/20",
    lime: "bg-white/14 text-white border-white/20",
    sky: "bg-white/14 text-white border-white/20",
    amber: "bg-white/14 text-white border-white/20",
    green: "bg-white/16 text-white border-white/24",
    red: "bg-white/16 text-white border-white/24",
    blue: "bg-white/14 text-white border-white/20",
    gold: "bg-white/14 text-white border-white/20",
  };

  return (
    <div
      className={`rounded-md border px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_14px_32px_rgba(0,0,0,0.18)] backdrop-blur-2xl ${tones[tone]}`}
    >
      <p className="text-xs font-bold text-white/62">{label}</p>
      <p className="mt-1 text-xl font-black leading-tight text-[#B6FF3B] [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}
