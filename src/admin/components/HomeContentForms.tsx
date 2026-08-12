import { useRef, useState } from "react";
import { X, Plus, GripVertical } from "lucide-react";
import { uploadImage } from "../lib/admin-data";
import { useDragReorder } from "../lib/useDragReorder";
import { Button } from "@/components/ui/button";
import { TextField } from "./SectionEditor";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Planes destacados ─────────────────────────── */

interface FeaturedPlansContent {
  title: string;
  subtitle: string;
  priceLabel: string;
  viewMore: string;
  viewAll: string;
}

export function FeaturedPlansForm({
  value,
  onChange,
}: {
  value: FeaturedPlansContent;
  onChange: (v: FeaturedPlansContent) => void;
}) {
  return (
    <div className="space-y-3">
      <TextField label="Título" value={value.title ?? ""} onChange={(v) => onChange({ ...value, title: v })} />
      <TextField
        label="Subtítulo"
        value={value.subtitle ?? ""}
        onChange={(v) => onChange({ ...value, subtitle: v })}
      />
      <TextField
        label='Etiqueta de precio (ej. "Desde")'
        value={value.priceLabel ?? ""}
        onChange={(v) => onChange({ ...value, priceLabel: v })}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label='Texto botón "ver más" (tarjeta)'
          value={value.viewMore ?? ""}
          onChange={(v) => onChange({ ...value, viewMore: v })}
        />
        <TextField
          label='Texto botón "ver todos"'
          value={value.viewAll ?? ""}
          onChange={(v) => onChange({ ...value, viewAll: v })}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────── Promociones ─────────────────────────────── */

interface PromotionBanner {
  id: string;
  alt: string;
  url: string;
}
interface PromotionValueCard {
  id: string;
  title: string;
  description: string;
}
interface PromotionsContent {
  sectionTitle: string;
  banners: PromotionBanner[];
  valueCards: PromotionValueCard[];
}

export function PromotionsForm({
  value,
  onChange,
}: {
  value: PromotionsContent;
  onChange: (v: PromotionsContent) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const banners = value.banners ?? [];
  const valueCards = value.valueCards ?? [];
  const bannersDrag = useDragReorder(banners, (next) => onChange({ ...value, banners: next }));

  const addBanner = async (file: File) => {
    setUploading(true);
    const { url, error } = await uploadImage(file, "promotions");
    if (url) {
      onChange({ ...value, banners: [...banners, { id: crypto.randomUUID(), alt: "", url }] });
    } else if (error) {
      alert(`Error al subir imagen: ${error}`);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <TextField
        label="Título de la sección"
        value={value.sectionTitle ?? ""}
        onChange={(v) => onChange({ ...value, sectionTitle: v })}
      />

      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Banners (imágenes rotativas) — arrástralos para cambiar el orden
        </label>
        <div className="mt-2 space-y-2">
          {banners.map((b, i) => (
            <div
              key={b.id}
              {...bannersDrag.dropTargetProps(i)}
              className={cn(
                "flex items-center gap-2 rounded-md border border-border bg-white p-2 transition-opacity",
                bannersDrag.isDragging(i) && "opacity-40",
                bannersDrag.isOver(i) && "border-t-2 border-t-teal-500"
              )}
            >
              <span
                {...bannersDrag.handleProps(i)}
                className="-m-2 flex shrink-0 cursor-grab items-center justify-center p-2 text-muted-foreground active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" />
              </span>
              <img src={b.url} alt="" className="h-12 w-20 shrink-0 rounded object-cover" />
              <input
                value={b.alt}
                onChange={(e) => {
                  const next = [...banners];
                  next[i] = { ...b, alt: e.target.value };
                  onChange({ ...value, banners: next });
                }}
                placeholder="Texto alternativo (accesibilidad)"
                className="min-w-0 flex-1 rounded-md border border-input px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => onChange({ ...value, banners: banners.filter((x) => x.id !== b.id) })}
                className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-red-600"
                aria-label="Eliminar banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && addBanner(e.target.files[0])}
        />
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Plus className="h-4 w-4" /> {uploading ? "Subiendo…" : "Agregar banner"}
        </Button>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Tarjetas de valor (íconos fijos — solo se edita el texto)
        </label>
        <div className="mt-2 space-y-2">
          {valueCards.map((c, i) => (
            <div key={c.id} className="space-y-1 rounded-md border border-border p-2">
              <input
                value={c.title}
                onChange={(e) => {
                  const next = [...valueCards];
                  next[i] = { ...c, title: e.target.value };
                  onChange({ ...value, valueCards: next });
                }}
                placeholder="Título"
                className="w-full rounded-md border border-input px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={c.description}
                onChange={(e) => {
                  const next = [...valueCards];
                  next[i] = { ...c, description: e.target.value };
                  onChange({ ...value, valueCards: next });
                }}
                placeholder="Descripción"
                className="w-full rounded-md border border-input px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Destinos internacionales ──────────────────────── */

interface InternationalDestination {
  name: string;
  eyebrow: string;
  image: string;
  description: string;
}
interface InternationalContent {
  title: string;
  titleHighlight: string;
  subtitle: string;
  destinations: InternationalDestination[];
}

export function InternationalForm({
  value,
  onChange,
}: {
  value: InternationalContent;
  onChange: (v: InternationalContent) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const destinations = value.destinations ?? [];
  const destinationsDrag = useDragReorder(destinations, (next) => onChange({ ...value, destinations: next }));

  const addDestination = async (file: File) => {
    setUploading(true);
    const { url, error } = await uploadImage(file, "international");
    if (url) {
      onChange({
        ...value,
        destinations: [...destinations, { name: "", eyebrow: "", image: url, description: "" }],
      });
    } else if (error) {
      alert(`Error al subir imagen: ${error}`);
    }
    setUploading(false);
  };

  const patchDestination = (i: number, patch: Partial<InternationalDestination>) => {
    const next = [...destinations];
    next[i] = { ...next[i], ...patch };
    onChange({ ...value, destinations: next });
  };

  return (
    <div className="space-y-4">
      <TextField label="Título" value={value.title ?? ""} onChange={(v) => onChange({ ...value, title: v })} />
      <TextField
        label="Título destacado (color acento)"
        value={value.titleHighlight ?? ""}
        onChange={(v) => onChange({ ...value, titleHighlight: v })}
      />
      <TextField
        label="Subtítulo"
        value={value.subtitle ?? ""}
        onChange={(v) => onChange({ ...value, subtitle: v })}
      />

      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Destinos — arrástralos para cambiar el orden
        </label>
        <div className="mt-2 space-y-2">
          {destinations.map((d, i) => (
            <div
              key={i}
              {...destinationsDrag.dropTargetProps(i)}
              className={cn(
                "flex gap-2 rounded-md border border-border bg-white p-2 transition-opacity",
                destinationsDrag.isDragging(i) && "opacity-40",
                destinationsDrag.isOver(i) && "border-t-2 border-t-teal-500"
              )}
            >
              <span
                {...destinationsDrag.handleProps(i)}
                className="-m-2 flex shrink-0 cursor-grab items-center justify-center self-start p-2 text-muted-foreground active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" />
              </span>
              <img src={d.image} alt="" className="h-16 w-14 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1 space-y-1">
                <input
                  value={d.name}
                  onChange={(e) => patchDestination(i, { name: e.target.value })}
                  placeholder="Nombre (ej. San Andrés)"
                  className="w-full rounded-md border border-input px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  value={d.eyebrow}
                  onChange={(e) => patchDestination(i, { eyebrow: e.target.value })}
                  placeholder="Frase corta (ej. Mar de siete colores)"
                  className="w-full rounded-md border border-input px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  value={d.description}
                  onChange={(e) => patchDestination(i, { description: e.target.value })}
                  rows={2}
                  placeholder="Descripción"
                  className="w-full rounded-md border border-input px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...value, destinations: destinations.filter((_, idx) => idx !== i) })}
                className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-red-600"
                aria-label="Eliminar destino"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && addDestination(e.target.files[0])}
        />
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Plus className="h-4 w-4" /> {uploading ? "Subiendo…" : "Agregar destino"}
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Viajes en grupo ────────────────────────── */

interface GroupTripBenefit {
  title: string;
  description: string;
}
interface GroupTripStat {
  label: string;
  value: string;
}
interface GroupTripsContent {
  label: string;
  title: string;
  titleHighlight: string;
  description: string;
  ctaQuote: string;
  ctaPlans: string;
  benefits: GroupTripBenefit[];
  stats: GroupTripStat[];
}

export function GroupTripsForm({
  value,
  onChange,
}: {
  value: GroupTripsContent;
  onChange: (v: GroupTripsContent) => void;
}) {
  const benefits = value.benefits ?? [];
  const stats = value.stats ?? [];

  return (
    <div className="space-y-4">
      <TextField
        label="Etiqueta (badge)"
        value={value.label ?? ""}
        onChange={(v) => onChange({ ...value, label: v })}
      />
      <TextField label="Título" value={value.title ?? ""} onChange={(v) => onChange({ ...value, title: v })} />
      <TextField
        label="Título destacado (color acento)"
        value={value.titleHighlight ?? ""}
        onChange={(v) => onChange({ ...value, titleHighlight: v })}
      />
      <TextField
        label="Descripción"
        value={value.description ?? ""}
        onChange={(v) => onChange({ ...value, description: v })}
        textarea
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label='Texto botón "cotizar"'
          value={value.ctaQuote ?? ""}
          onChange={(v) => onChange({ ...value, ctaQuote: v })}
        />
        <TextField
          label='Texto botón "ver planes"'
          value={value.ctaPlans ?? ""}
          onChange={(v) => onChange({ ...value, ctaPlans: v })}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Beneficios (íconos fijos — solo se edita el texto)
        </label>
        <div className="mt-2 space-y-2">
          {benefits.map((b, i) => (
            <div key={i} className="space-y-1 rounded-md border border-border p-2">
              <input
                value={b.title}
                onChange={(e) => {
                  const next = [...benefits];
                  next[i] = { ...b, title: e.target.value };
                  onChange({ ...value, benefits: next });
                }}
                placeholder="Título"
                className="w-full rounded-md border border-input px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={b.description}
                onChange={(e) => {
                  const next = [...benefits];
                  next[i] = { ...b, description: e.target.value };
                  onChange({ ...value, benefits: next });
                }}
                placeholder="Descripción"
                className="w-full rounded-md border border-input px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Estadísticas</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1 rounded-md border border-border p-2">
              <input
                value={s.value}
                onChange={(e) => {
                  const next = [...stats];
                  next[i] = { ...s, value: e.target.value };
                  onChange({ ...value, stats: next });
                }}
                placeholder="Valor (ej. 500+)"
                className="w-full rounded-md border border-input px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={s.label}
                onChange={(e) => {
                  const next = [...stats];
                  next[i] = { ...s, label: e.target.value };
                  onChange({ ...value, stats: next });
                }}
                placeholder="Etiqueta"
                className="w-full rounded-md border border-input px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Llamado a la acción final ──────────────────────── */

interface ReadyCtaContent {
  ctaTitle: string;
  ctaDescription: string;
  ctaContact: string;
  ctaPlans: string;
  [key: string]: unknown;
}

export function ReadyCtaForm({
  value,
  onChange,
}: {
  value: ReadyCtaContent;
  onChange: (v: ReadyCtaContent) => void;
}) {
  return (
    <div className="space-y-3">
      <TextField
        label="Título"
        value={value.ctaTitle ?? ""}
        onChange={(v) => onChange({ ...value, ctaTitle: v })}
      />
      <TextField
        label="Descripción"
        value={value.ctaDescription ?? ""}
        onChange={(v) => onChange({ ...value, ctaDescription: v })}
        textarea
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label='Texto botón "contáctanos"'
          value={value.ctaContact ?? ""}
          onChange={(v) => onChange({ ...value, ctaContact: v })}
        />
        <TextField
          label='Texto botón "ver planes"'
          value={value.ctaPlans ?? ""}
          onChange={(v) => onChange({ ...value, ctaPlans: v })}
        />
      </div>
    </div>
  );
}

/* ───────────────────────────── Testimonios (título) ─────────────────────── */

interface TestimonialsHeaderContent {
  title: string;
  subtitle: string;
  [key: string]: unknown;
}

export function TestimonialsHeaderForm({
  value,
  onChange,
}: {
  value: TestimonialsHeaderContent;
  onChange: (v: TestimonialsHeaderContent) => void;
}) {
  return (
    <div className="space-y-3">
      <TextField label="Título" value={value.title ?? ""} onChange={(v) => onChange({ ...value, title: v })} />
      <TextField
        label="Subtítulo"
        value={value.subtitle ?? ""}
        onChange={(v) => onChange({ ...value, subtitle: v })}
      />
    </div>
  );
}

/* ────────────────────────── Cinta de mensajes (ticker) ──────────────────── */

interface TickerContent {
  items: string[];
}

export function TickerForm({ value, onChange }: { value: TickerContent; onChange: (v: TickerContent) => void }) {
  const items = value.items ?? [];

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">Mensajes (se repiten en bucle)</label>
      <div className="mt-2 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange({ items: next });
              }}
              className="min-w-0 flex-1 rounded-md border border-input px-2 py-1 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) })}
              className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-red-600"
              aria-label="Eliminar mensaje"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => onChange({ items: [...items, "NUEVO MENSAJE"] })}
      >
        <Plus className="h-4 w-4" /> Agregar mensaje
      </Button>
    </div>
  );
}

/* ─────────────────────── Banner de salidas programadas ──────────────────── */

interface TitleSubtitleContent {
  title: string;
  subtitle: string;
}

export function ScheduledDeparturesBannerForm({
  value,
  onChange,
}: {
  value: TitleSubtitleContent;
  onChange: (v: TitleSubtitleContent) => void;
}) {
  return (
    <div className="space-y-3">
      <TextField label="Título" value={value.title ?? ""} onChange={(v) => onChange({ ...value, title: v })} />
      <TextField
        label="Subtítulo"
        value={value.subtitle ?? ""}
        onChange={(v) => onChange({ ...value, subtitle: v })}
        textarea
      />
    </div>
  );
}

export function ScheduledDeparturesForm({
  value,
  onChange,
}: {
  value: TitleSubtitleContent;
  onChange: (v: TitleSubtitleContent) => void;
}) {
  return (
    <div className="space-y-3">
      <TextField label="Título" value={value.title ?? ""} onChange={(v) => onChange({ ...value, title: v })} />
      <TextField
        label="Subtítulo"
        value={value.subtitle ?? ""}
        onChange={(v) => onChange({ ...value, subtitle: v })}
        textarea
      />
    </div>
  );
}
