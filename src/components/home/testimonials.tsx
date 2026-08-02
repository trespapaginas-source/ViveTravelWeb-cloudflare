import { Star } from "lucide-react";
import { useTestimonials } from "@/hooks/use-plans";
import { useSiteContent } from "@/lib/use-site-content";
import { SectionHeader } from "@/components/shared/section-header";
import type { Testimonial } from "@/lib/data";

/** Logo de Google (SVG simplificado multi-color). */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.3 5.3c-.4.4 6.5-4.7 6.5-14.8 0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

/**
 * Testimonials — reseñas de Google. Marquee infinito en desktop, scroll-snap en móvil.
 */
export function Testimonials() {
  const { data: testimonials } = useTestimonials();
  const { content } = useSiteContent();
  const t = content.testimonials;
  const marquee = [...testimonials, ...testimonials];

  return (
    <section className="bg-zinc-50/60 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t.title} subtitle={t.subtitle} />
      </div>

      {/* Marquee desktop */}
      <div className="group relative mt-8 hidden overflow-hidden md:block">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-zinc-50 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-zinc-50 to-transparent" />
        <div className="flex w-max gap-4 px-4 animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]">
          {marquee.map((rev, i) => (
            <TestimonialCard key={i} rev={rev} />
          ))}
        </div>
      </div>

      {/* Scroll-snap móvil */}
      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {testimonials.map((rev, i) => (
          <TestimonialCard key={i} rev={rev} className="shrink-0" />
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({
  rev,
  className = "",
}: {
  rev: Testimonial;
  className?: string;
}) {
  return (
    <div
      className={`flex h-[210px] w-[290px] flex-col rounded-2xl border border-border bg-card p-4 shadow-sm sm:w-[320px] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {rev.avatarUrl ? (
            <img
              src={rev.avatarUrl}
              alt={`Foto de ${rev.name}`}
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: rev.avatarBg || "#1a73e8" }}
            >
              {rev.avatar}
            </div>
          )}
          <div className="min-w-0">
            <p className="line-clamp-1 text-[13px] font-semibold text-card-foreground">
              {rev.name}
            </p>
            <p className="text-[11px] text-muted-foreground">{rev.location}</p>
          </div>
        </div>
        <GoogleLogo />
      </div>
      <div className="mt-2 flex gap-0.5">
        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="mt-2 line-clamp-4 text-[12.5px] italic text-muted-foreground">
        &ldquo;{rev.text}&rdquo;
      </p>
    </div>
  );
}
