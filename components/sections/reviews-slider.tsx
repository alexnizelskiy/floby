"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Star, BadgeCheck } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { Section, SectionHeading } from "@/components/ui/section";
import { reviews } from "@/content/reviews";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

export function ReviewsSlider() {
  return (
    <Section id="reviews" className="scroll-mt-24 overflow-hidden">
      <SectionHeading
        eyebrow="Отзывы клиентов"
        title="Нас рекомендуют друзьям"
        description="Реальные впечатления клиентов floby из Ростова-на-Дону."
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

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
          {review.initials}
        </div>
        <div>
          <figcaption className="flex items-center gap-1.5 font-semibold">
            {review.name}
            {review.verified && <BadgeCheck className="size-4 text-primary" />}
          </figcaption>
          <p className="text-xs text-muted-foreground">{review.serviceLabel}</p>
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

      <blockquote className="flex-1 text-sm text-muted-foreground">
        “{review.text}”
      </blockquote>
    </figure>
  );
}
