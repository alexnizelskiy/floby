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
  // adding a phone (social-login users who have none yet)
  const [phoneInput, setPhoneInput] = React.useState("");
  const [phoneErr, setPhoneErr] = React.useState<string | null>(null);
  const [phoneSaving, setPhoneSaving] = React.useState(false);

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

  async function savePhone(e: React.FormEvent) {
    e.preventDefault();
    setPhoneErr(null);
    if (phoneInput.replace(/\D/g, "").length < 10) {
      setPhoneErr("Введите корректный номер");
      return;
    }
    setPhoneSaving(true);
    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneInput }),
    })
      .then((x) => x.json())
      .catch(() => ({ ok: false }));
    setPhoneSaving(false);
    if (r.ok) {
      setPhone(phoneInput.replace(/\D/g, ""));
      router.refresh();
    } else {
      setPhoneErr(
        r.error === "phone_taken"
          ? "Этот номер уже привязан к другому аккаунту"
          : "Не удалось сохранить номер"
      );
    }
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
        {phone ? (
          <>
            <p className="mt-4 text-sm text-muted-foreground">Ваш номер для входа</p>
            <p className="mt-1 text-lg font-semibold">{formatPhone(phone)}</p>
          </>
        ) : (
          <form className="mt-4 flex flex-col gap-3" onSubmit={savePhone}>
            <p className="text-sm text-muted-foreground">
              Вы вошли через соцсеть. Добавьте номер, чтобы клинер мог связаться с вами.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="flex-1">
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phoneInput}
                  onChange={(e) => { setPhoneInput(e.target.value); setPhoneErr(null); }}
                  aria-invalid={!!phoneErr}
                />
                {phoneErr && <p className="mt-1 text-sm text-destructive">{phoneErr}</p>}
              </div>
              <Button type="submit" disabled={phoneSaving}>
                {phoneSaving ? "Сохраняем…" : "Сохранить номер"}
              </Button>
            </div>
          </form>
        )}
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
