import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "floby — клининговая компания в Ростове-на-Дону";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Грузим Raleway с поддержкой кириллицы (Involve — только латиница).
 * User-Agent заставляет Google отдать ttf вместо woff2, который Satori не парсит.
 * При сбое сети возвращаем null и рендерим встроенным шрифтом (латиница).
 */
async function loadFont(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Raleway:wght@${weight}&subset=cyrillic,latin`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }
    ).then((r) => r.text());
    const url = css.match(/src: url\((https:\/\/[^)]+\.(?:ttf|otf))\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [medium, bold] = await Promise.all([loadFont(500), loadFont(800)]);
  const fonts = [
    medium && { name: "Raleway", data: medium, weight: 500 as const, style: "normal" as const },
    bold && { name: "Raleway", data: bold, weight: 800 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 500 | 800; style: "normal" }[];

  const fontFamily = fonts.length ? "Raleway" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #23b059 0%, #0f8a43 100%)",
          color: "#ffffff",
          fontFamily,
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              color: "#23b059",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            f
          </div>
          <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>floby</span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.08 }}>
            Уборка квартир, домов и офисов
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 500, color: "rgba(255,255,255,0.92)" }}>
            {siteConfig.geo.city} · фиксированная цена · гарантия качества
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 30,
            fontWeight: 500,
            borderTop: "1px solid rgba(255,255,255,0.3)",
            paddingTop: 28,
          }}
        >
          <span>floby.ru</span>
          <span>{siteConfig.contacts.phone}</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
