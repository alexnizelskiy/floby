"use client";

import * as React from "react";
import { Copy, Check, Send, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReferralShare({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareText = encodeURIComponent(
    "Дарю тебе 500 ₽ на первую уборку в floby! Заказывай по моей ссылке:"
  );
  const url = encodeURIComponent(link);

  const shares = [
    { label: "Telegram", href: `https://t.me/share/url?url=${url}&text=${shareText}`, icon: Send },
    { label: "WhatsApp", href: `https://wa.me/?text=${shareText}%20${url}`, icon: MessageCircle },
    { label: "ВКонтакте", href: `https://vk.com/share.php?url=${url}`, icon: Share2 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 p-1.5 pl-4 backdrop-blur">
        <span className="flex-1 truncate text-sm font-medium">{link}</span>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
            copied ? "bg-white text-brand-700" : "bg-white/20 text-white hover:bg-white/30"
          )}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/80">Поделиться:</span>
        {shares.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="grid size-11 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <s.icon className="size-5" />
          </a>
        ))}
      </div>
    </div>
  );
}
