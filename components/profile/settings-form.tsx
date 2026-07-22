"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Saved({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
      <Check className="size-4" /> Сохранено
    </span>
  );
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length !== 11) return phone;
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}

export function SettingsForm() {
  const router = useRouter();
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setPhone(d.user.phone ?? "");
          setName(d.user.name ?? "");
          setEmail(d.user.email ?? "");
        }
      })
      .catch(() => {});
  }, []);

  async function saveData(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-7 md:p-8">
        <h2 className="text-lg font-bold">Телефон</h2>
        <p className="mt-4 text-sm text-muted-foreground">Ваш номер для входа</p>
        <p className="mt-1 text-lg font-semibold">{phone ? formatPhone(phone) : "—"}</p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-7 md:p-8">
        <h2 className="text-lg font-bold">Личные данные</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={saveData}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="s-name">Имя</Label>
              <Input id="s-name" placeholder="Имя" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="s-email">Электронная почта</Label>
              <Input id="s-email" type="email" placeholder="Электронная почта" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit">Сохранить изменения</Button>
            <Saved show={saved} />
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-7 md:p-8">
        <h2 className="text-lg font-bold">Почтовые рассылки</h2>
        <label className="mt-4 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={subscribed}
            onChange={(e) => setSubscribed(e.target.checked)}
            className="size-4 rounded border-input accent-[var(--primary)]"
          />
          Получать новости и спецпредложения
        </label>
      </section>

      <button
        type="button"
        onClick={logout}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 font-semibold text-destructive transition-colors hover:bg-surface"
      >
        <LogOut className="size-5" /> Выйти из аккаунта
      </button>
    </div>
  );
}
