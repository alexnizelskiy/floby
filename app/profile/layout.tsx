import type { Metadata } from "next";
import { User } from "lucide-react";
import { ProfileNav } from "@/components/profile/profile-nav";
import { ProfileLogin } from "@/components/auth/profile-login";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { absolute: "Личный кабинет — floby" },
  robots: { index: false, follow: false },
};

function formatPhone(phone: string) {
  // +79285551122 -> +7 (928) 555-11-22
  const d = phone.replace(/\D/g, "");
  if (d.length !== 11) return phone;
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="bg-surface">
        <ProfileLogin />
      </div>
    );
  }

  return (
    <div className="bg-surface">
      <div className="container-page py-10 md:py-14">
        <div className="mb-8 flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">
            <User className="size-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">{user.name || "Личный кабинет"}</h1>
            <p className="text-sm text-muted-foreground">{formatPhone(user.phone)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-2">
              <ProfileNav />
            </div>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
