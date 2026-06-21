"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/workout/new", label: "训练" },
  { href: "/exercises", label: "动作库" },
  { href: "/history", label: "历史" },
  { href: "/profile", label: "我的" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return (
    <div className="liquid-glass-app min-h-dvh text-zinc-50">
      <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-30 pt-5">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex h-12 items-center justify-center rounded-md text-[0.72rem] font-semibold transition ${
                  active
                    ? "bg-[#B6FF3B] text-[#0B0F14] shadow-sm"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
