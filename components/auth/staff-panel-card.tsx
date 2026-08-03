"use client";

import Link from "next/link";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import { useRoleFlags } from "@/components/auth/auth-provider";

/**
 * Shown to logged-in staff/executors in place of client "order a cleaning" UI —
 * they don't book cleanings, so we point them to their work panel instead.
 */
export function StaffPanelCard({ className }: { className?: string }) {
  const { dashboardPath, isStaff } = useRoleFlags();
  if (!dashboardPath) return null;

  return (
    <Link
      href={dashboardPath}
      className={
        "flex w-full items-center justify-between gap-4 rounded-2xl border border-brand-300 bg-white/95 p-5 text-left shadow-[var(--shadow-sm)] transition-colors hover:bg-brand-50 " +
        (className ?? "")
      }
    >
      <span className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <LayoutDashboard className="size-5" />
        </span>
        <span>
          <span className="block font-semibold text-foreground">
            {isStaff ? "Панель управления" : "Кабинет клинера"}
          </span>
          <span className="block text-sm text-muted-foreground">
            {isStaff
              ? "Заявки, исполнители, аналитика"
              : "Ваши уборки, расписание и заработок"}
          </span>
        </span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-primary" />
    </Link>
  );
}
