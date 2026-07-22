import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata: Metadata = {
  title: { absolute: "Админка — floby" },
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!isStaff(user)) {
    return (
      <div className="container-page py-24">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <ShieldAlert className="size-7" />
          </span>
          <h1 className="text-2xl font-bold">Доступ только для персонала</h1>
          <p className="text-muted-foreground">
            Эта страница доступна администраторам и менеджерам. Войдите под рабочим номером.
          </p>
          <Link href="/profile" className="font-semibold text-primary hover:underline">
            Войти →
          </Link>
        </div>
      </div>
    );
  }

  return <AdminPanel role={user!.role} />;
}
