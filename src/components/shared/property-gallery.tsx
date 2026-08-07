import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop";

interface PropertyGalleryProps {
  images: string[];
  title?: string;
  className?: string;
  variant?: "default" | "booking";
}

/**
 * PropertyGallery — galería de imágenes responsive con visor (lightbox).
 * Variantes: default (grid simple para 1-2 fotos), booking (hero + thumbs).
 */
export function PropertyGallery({
  images,
  title,
  className,
  variant = "default",
}: PropertyGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const safeImages = images.length > 0 ? images : [FALLBACK];

  const openAll = () => setShowAll(true);

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop */}
      <div className="hidden sm:block">
        {variant === "booking" ? (
          <BookingDesktopGallery images={safeImages} onOpen={openAll} />
        ) : (
          <DefaultDesktopGallery images={safeImages} onOpen={openAll} />
        )}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <MobileGallery images={safeImages} onOpen={openAll} />
      </div>

      {/* Todas las fotos */}
      {showAll && (
        <AllPhotosOverlay
          images={safeImages}
          title={title}
          onClose={() => setShowAll(false)}
          onSelect={(i) => setLightboxIndex(i)}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={safeImages}
          initialIndex={lightboxIndex}
          title={title}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────── Imagen reutilizable ─────────────────────── */

function GalleryImage({
  src,
  alt,
  priority,
  onClick,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onClick={onClick}
      onError={(e) => {
        e.currentTarget.src = FALLBACK;
      }}
      className={cn("h-full w-full cursor-pointer object-cover", className)}
    />
  );
}

/* ─────────────────────── Variantes desktop ─────────────────────── */

function DefaultDesktopGallery({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  if (images.length === 1) {
    return (
      <div className="h-[460px] overflow-hidden rounded-2xl">
        <GalleryImage src={images[0]} alt="Foto" priority onClick={() => onOpen(0)} />
      </div>
    );
  }
  if (images.length === 2) {
    return (
      <div className="flex h-[460px] gap-2 overflow-hidden rounded-2xl">
        <div className="flex-[3]" onClick={() => onOpen(0)}>
          <GalleryImage src={images[0]} alt="Foto" priority />
        </div>
        <div className="flex-[2]" onClick={() => onOpen(1)}>
          <GalleryImage src={images[1]} alt="Foto" />
        </div>
      </div>
    );
  }
  return <BookingDesktopGallery images={images} onOpen={onOpen} />;
}

function BookingDesktopGallery({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  const main = images[0];
  const rightImage = images[1];
  const thumbs = images.slice(2, 7);
  const shown = (rightImage ? 2 : 1) + thumbs.length;
  const extra = Math.max(0, images.length - shown);

  return (
    <div className="space-y-2">
      <div className="grid h-[360px] grid-cols-12 gap-2 overflow-hidden rounded-2xl">
        <div
          className={cn(
            "h-full overflow-hidden",
            rightImage ? "col-span-7" : "col-span-12"
          )}
          onClick={() => onOpen(0)}
        >
          <GalleryImage src={main} alt="Foto principal" priority />
        </div>
        {rightImage && (
          <div
            className="col-span-5 h-full overflow-hidden"
            onClick={() => onOpen(1)}
          >
            <GalleryImage src={rightImage} alt="Foto 2" />
          </div>
        )}
      </div>
      {thumbs.length > 0 && (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${thumbs.length}, 1fr)` }}
        >
          {thumbs.map((img, i) => (
            <div
              key={i}
              className="relative h-24 overflow-hidden rounded-lg"
              onClick={() => onOpen(i + 2)}
            >
              <GalleryImage src={img} alt={`Foto ${i + 3}`} />
              {i === thumbs.length - 1 && extra > 0 && (
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 text-sm font-semibold text-white">
                  +{extra} fotos
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Variante móvil ─────────────────────── */

function MobileGallery({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  const cells = images.slice(0, 4);
  const extra = Math.max(0, images.length - 4);

  return (
    <div className="grid grid-cols-2 gap-1">
      {Array.from({ length: 4 }).map((_, i) => {
        const img = cells[i];
        return (
          <div
            key={i}
            className={cn(
              "relative aspect-[4/3] overflow-hidden",
              !img && "bg-muted"
            )}
            onClick={() => img && onOpen(i)}
          >
            {img && <GalleryImage src={img} alt={`Foto ${i + 1}`} priority={i === 0} />}
            {i === 3 && extra > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
                +{extra} fotos
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── Todas las fotos (grid completo) ─────────────────────── */

function AllPhotosOverlay({
  images,
  title,
  onClose,
  onSelect,
}: {
  images: string[];
  title?: string;
  onClose: () => void;
  onSelect: (i: number) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[190] flex flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm font-medium text-foreground hover:opacity-70"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" /> Galería
        </button>
        {title && (
          <span className="truncate text-sm text-muted-foreground">{title}</span>
        )}
        <button
          onClick={onClose}
          className="ml-auto rounded-full p-1.5 hover:bg-muted"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className="aspect-[4/3] overflow-hidden rounded-xl"
            >
              <img
                src={img}
                alt={`Foto ${i + 1}`}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK;
                }}
                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────── Lightbox / Visor ─────────────────────── */

export function Lightbox({
  images,
  initialIndex,
  onClose,
  title,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  title?: string;
}) {
  const [index, setIndex] = useState(initialIndex);
  const len = images.length;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + len) % len);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % len);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [len, onClose]);

  const go = (delta: number) => setIndex((i) => (i + delta + len) % len);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="truncate text-sm font-medium">{title}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm">
            {index + 1} / {len}
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Imagen */}
      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-10">
        <img
          src={images[index]}
          alt={`Foto ${index + 1}`}
          className="max-h-[80vh] max-w-full object-contain"
        />
        {len > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {len > 1 && (
        <div className="flex gap-2 overflow-x-auto p-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === index ? "border-white opacity-100" : "border-transparent opacity-40"
              )}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
