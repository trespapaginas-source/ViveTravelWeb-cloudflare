import { useState } from "react";
import { useSiteContent } from "@/lib/use-site-content";

/**
 * ScheduledDeparturesBanner — banner de video/fondo con CTA hacia salidas programadas.
 * El video se carga progresivamente sobre una imagen poster.
 */
export function ScheduledDeparturesBanner() {
  const { content } = useSiteContent();
  void content; // textos hardcodeados como en el original
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative w-full overflow-hidden border-y border-zinc-800 bg-zinc-900 py-10 sm:py-12 lg:py-16">
      {/* Fondo: poster + video */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/sky-banner-bg.jpg"
          alt=""
          aria-hidden="true"
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            videoLoaded ? "opacity-0" : "opacity-100"
          }`}
          onError={(e) => {
            e.currentTarget.src = "/images/sky-banner-bg.png";
          }}
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/sky-banner-bg.jpg"
          onCanPlay={() => setVideoLoaded(true)}
          onLoadedData={() => setVideoLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/videos/sky-banner-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white sm:px-6">
        <h2
          className="text-2xl font-extrabold leading-tight drop-shadow-lg sm:text-3xl lg:text-4xl"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
        >
          Tu próximo viaje ya tiene fecha confirmada
        </h2>
        <p
          className="mx-auto mt-3 max-w-xl text-sm text-white/90 drop-shadow sm:text-base"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          Viaja en grupo con itinerario 100% organizado, guías acompañantes y
          fechas de salida garantizadas por todo Colombia.
        </p>
      </div>
    </section>
  );
}
