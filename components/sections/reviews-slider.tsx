"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Star, BadgeCheck } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { Section, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

interface PublicReview {
  id: string;
  name: string;
  initials: string;
  rating: number;
  text: string | null;
  service: string | null;
  date: string;
}

export function ReviewsSlider() {
  const [reviews, setReviews] = React.useState<PublicReview[] | null>(null);
  const [stats, setStats] = React.useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

  React.useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setReviews(d.reviews as PublicReview[]);
          setStats(d.stats);
        } else setReviews([]);
      })
      .catch(() => setReviews([]));
  }, []);

  // Пока нет ни одного реального отзыва — секцию не показываем
  if (reviews === null || reviews.length === 0) return null;

  return (
    <Section id="reviews" className="scroll-mt-24 overflow-hidden">
      <SectionHeading
        eyebrow="Отзывы клиентов"
        title="Нас рекомендуют друзьям"
        description={
          stats.count > 0
            ? `Средняя оценка ${stats.avg.toFixed(1)} из 5 по ${stats.count} ${plural(
                stats.count,
                "отзыву",
                "отзывам",
                "отзывам"
              )}.`
            : "Реальные впечатления клиентов floby из Ростова-на-Дону."
        }
      />

      <div className="mt-12">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1.1}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="!pb-14"
        >
          {reviews.map((r) => (
            <SwiperSlide key={r.id} className="h-auto">
              <ReviewCard review={r} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Section>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
          {review.initials}
        </div>
        <div>
          <figcaption className="flex items-center gap-1.5 font-semibold">
            {review.name}
            <BadgeCheck className="size-4 text-primary" />
          </figcaption>
          {review.service && <p className="text-xs text-muted-foreground">{review.service}</p>}
        </div>
      </div>

      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i < review.rating ? "fill-warning text-warning" : "text-border"
            )}
          />
        ))}
      </div>

      {review.text && (
        <blockquote className="flex-1 text-sm text-muted-foreground">“{review.text}”</blockquote>
      )}
    </figure>
  );
}
