import type { Metadata } from "next";
import { Star, BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/components/sections/cta-band";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { getPublicReviews, getReviewStats, type PublicReview } from "@/lib/reviews";

export const metadata: Metadata = buildMetadata({
  title: "Отзывы клиентов о клининге floby в Ростове-на-Дону",
  description:
    "Реальные отзывы клиентов floby об уборке квартир в Ростове-на-Дону. Оценки оставляют только клиенты после выполненной уборки.",
  keywords: ["отзывы клининг Ростов", "отзывы об уборке квартир", "floby отзывы"],
  path: "/reviews",
});

// Отзывы меняются со временем — рендерим по запросу, не на этапе сборки
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  let reviews: PublicReview[] = [];
  let stats = { avg: 0, count: 0 };
  try {
    [reviews, stats] = await Promise.all([getPublicReviews(60), getReviewStats()]);
  } catch {
    /* база недоступна — покажем пустое состояние */
  }

  return (
    <>
      <PageHeader
        eyebrow="Отзывы"
        title="Что говорят наши клиенты"
        description="Оценку может оставить только клиент, у которого уборка уже выполнена — поэтому здесь только реальные отзывы."
        crumbs={[{ label: "Отзывы", href: "/reviews" }]}
      >
        {stats.count > 0 && (
          <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3">
            <span className="flex items-center gap-1 text-2xl font-bold">
              {stats.avg.toFixed(1)}
              <Star className="size-6 fill-warning text-warning" />
            </span>
            <span className="text-sm text-muted-foreground">
              средняя оценка<br />по {stats.count} отзывам
            </span>
          </div>
        )}
      </PageHeader>

      <Section>
        {reviews.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-lg font-semibold">Пока нет отзывов</p>
            <p className="mt-2 text-muted-foreground">
              Станьте первым: закажите уборку и поделитесь впечатлениями после её выполнения.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
                    {r.initials}
                  </div>
                  <div>
                    <figcaption className="flex items-center gap-1.5 font-semibold">
                      {r.name}
                      <BadgeCheck className="size-4 text-primary" />
                    </figcaption>
                    {r.service && <p className="text-xs text-muted-foreground">{r.service}</p>}
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-4", i < r.rating ? "fill-warning text-warning" : "text-border")} />
                  ))}
                </div>
                {r.text && <blockquote className="flex-1 text-sm text-muted-foreground">“{r.text}”</blockquote>}
              </figure>
            ))}
          </div>
        )}
      </Section>

      <CtaBand source="reviews-cta" />
    </>
  );
}
