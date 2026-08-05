import Image from "next/image";

/**
 * Full-width photo hero (homepage + cleaning-service pages): background image
 * with a title, subtitle and a CTA area (calculator form or order button)
 * passed as children, sitting on the white fade at the bottom.
 */
export function PhotoHero({
  image,
  imageAlt,
  title,
  subtitle,
  children,
  priority = false,
}: {
  image: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <section className="pt-8 md:pt-16">
      <div className="container-page">
        <div className="relative flex min-h-[560px] items-end justify-center overflow-hidden rounded-[2.25rem] md:h-[641px] md:rounded-[3.75rem]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 1440px) 100vw, 1390px"
            className="object-cover object-center"
          />
          {/* White fade to the bottom (CTA area) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(255,255,255,0.8)_78%,#ffffff_93%)]" />

          <div className="relative flex w-full flex-col items-center gap-4 px-4 pb-8 pt-10 md:px-10 md:pb-12">
            <h1 className="text-center text-3xl font-bold leading-tight text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="mb-2 text-center text-lg font-medium text-foreground/80 md:text-xl">
              {subtitle}
            </p>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
