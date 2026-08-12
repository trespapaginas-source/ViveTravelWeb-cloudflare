import { useEffect, useRef } from "react";
import { useSiteContent } from "@/lib/use-site-content";

/**
 * ScheduledDeparturesBanner — banner de video/fondo con CTA hacia salidas programadas.
 * El atributo nativo `poster` muestra la imagen mientras el video carga; el
 * propio navegador hace el reemplazo en cuanto arranca la reproducción, sin
 * necesitar una segunda capa <img> con transición de opacidad manejada por JS.
 */
const DEFAULT_TITLE = "Tu próximo viaje ya tiene fecha confirmada";
const DEFAULT_SUBTITLE =
  "Viaja en grupo con itinerario 100% organizado, guías acompañantes y fechas de salida garantizadas por todo Colombia.";

export function ScheduledDeparturesBanner() {
  const { content } = useSiteContent();
  const title = content.scheduledDeparturesBanner?.title || DEFAULT_TITLE;
  const subtitle = content.scheduledDeparturesBanner?.subtitle || DEFAULT_SUBTITLE;
  const videoRef = useRef<HTMLVideoElement>(null);

  const tryPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    // React no siempre sincroniza la propiedad `muted` del DOM a tiempo
    // para que el navegador autorice el autoplay solo con el atributo JSX.
    video.muted = true;
    video.play().catch(() => {
      // Autoplay bloqueado por el navegador: se mantiene el poster visible.
    });
  };

  // El primer intento puede fallar si la pestaña está en segundo plano al
  // montar (el navegador bloquea el autoplay sin avisar), así que se
  // reintenta cuando el documento vuelve a estar visible y cuando el video
  // confirma que ya tiene datos suficientes (canplay).
  useEffect(() => {
    tryPlay();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return (
    <section className="relative w-full overflow-hidden border-y border-zinc-800 bg-zinc-900 py-8 sm:py-10 lg:py-12">
      {/* Fondo: video con imagen poster nativa mientras carga */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/sky-banner-bg.jpg"
          onCanPlay={tryPlay}
          className="h-full w-full object-cover"
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
          {title}
        </h2>
        <p
          className="mx-auto mt-3 max-w-xl text-sm text-white/90 drop-shadow sm:text-base"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}
