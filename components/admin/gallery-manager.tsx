"use client";

import * as React from "react";
import { Eye, EyeOff, Trash2, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  before_url: string;
  after_url: string;
  title: string | null;
  cleaning_type: string | null;
  published: boolean;
  created_at: string;
}

const TYPE_OPTIONS = [
  { value: "", label: "Тип уборки (необязательно)" },
  { value: "regular", label: "Поддерживающая" },
  { value: "general", label: "Генеральная" },
  { value: "post_renovation", label: "После ремонта" },
];

const selectCls =
  "h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

const ERR: Record<string, string> = {
  missing_files: "Загрузите оба фото — «до» и «после»",
  unsupported_type: "Только JPG, PNG или WebP",
  too_large: "Файл больше 8 МБ",
  storage_unavailable: "Хранилище не настроено (нужен BLOB_READ_WRITE_TOKEN)",
};

export function GalleryManager() {
  const [items, setItems] = React.useState<Item[] | null>(null);
  const [title, setTitle] = React.useState("");
  const [cleaningType, setCleaningType] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const beforeRef = React.useRef<HTMLInputElement>(null);
  const afterRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/gallery").then((x) => x.json()).catch(() => null);
    if (r?.ok) setItems(r.items);
    else setItems([]);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const before = beforeRef.current?.files?.[0];
    const after = afterRef.current?.files?.[0];
    if (!before || !after) {
      setErr(ERR.missing_files);
      return;
    }
    const fd = new FormData();
    fd.append("before", before);
    fd.append("after", after);
    if (title.trim()) fd.append("title", title.trim());
    if (cleaningType) fd.append("cleaningType", cleaningType);

    setBusy(true);
    const r = await fetch("/api/gallery", { method: "POST", body: fd })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "upload_failed" }));
    setBusy(false);
    if (r.ok) {
      setTitle("");
      setCleaningType("");
      if (beforeRef.current) beforeRef.current.value = "";
      if (afterRef.current) afterRef.current.value = "";
      load();
    } else {
      setErr(ERR[r.error] ?? "Не удалось загрузить. Попробуйте ещё раз.");
    }
  }

  async function togglePublish(item: Item) {
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    load();
  }
  async function remove(id: string) {
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      {/* Upload form */}
      <form
        onSubmit={submit}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h2 className="flex items-center gap-2 font-semibold">
          <ImagePlus className="size-5 text-brand-600" /> Добавить пару «до / после»
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Фото «до»</span>
            <input ref={beforeRef} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Фото «после»</span>
            <input ref={afterRef} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Подпись (напр. «Кухня, 2-комн. квартира»)"
            maxLength={120}
            className={cn(selectCls, "min-w-[240px] flex-1")}
          />
          <select value={cleaningType} onChange={(e) => setCleaningType(e.target.value)} className={selectCls}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Опубликовать
          </button>
        </div>
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <p className="mt-3 text-xs text-muted-foreground">
          Публикуется сразу на главной. Фото исполнителей появляются здесь как «на модерации», пока вы их не опубликуете.
        </p>
      </form>

      {/* List */}
      {items === null ? (
        <div className="h-40 rounded-2xl border border-border bg-card" />
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Пока нет ни одной пары фото.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.before_url} alt="До" className="aspect-square w-full object-cover" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.after_url} alt="После" className="aspect-square w-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title || "Без подписи"}</p>
                  <span
                    className={cn(
                      "text-xs",
                      item.published ? "text-brand-700" : "text-amber-600"
                    )}
                  >
                    {item.published ? "Опубликовано" : "На модерации"}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => togglePublish(item)}
                    title={item.published ? "Снять с публикации" : "Опубликовать"}
                    className="grid size-9 place-items-center rounded-lg border border-border hover:bg-surface-strong"
                  >
                    {item.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    title="Удалить"
                    className="grid size-9 place-items-center rounded-lg border border-border text-destructive hover:bg-surface-strong"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
