import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  getSiteContent,
  updateSiteContent,
  listHeroImages,
  addHeroImage,
  updateHeroImage,
  deleteHeroImage,
  moveItem,
  uploadImage,
  type HeroImageRow,
} from "../lib/admin-data";
import { ReorderButtons } from "../components/ReorderButtons";
import { Button } from "@/components/ui/button";

interface HeroContent {
  brandLabel: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaPlans: string;
  ctaCabins: string;
}

export function HeroAdmin() {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [images, setImages] = useState<HeroImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reloadImages = () => listHeroImages().then(setImages);

  useEffect(() => {
    Promise.all([getSiteContent(), listHeroImages()])
      .then(([sc, imgs]) => {
        setHero(sc.hero as unknown as HeroContent);
        setImages(imgs);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!hero) return;
    setSaving(true);
    await updateSiteContent({ hero });
    setSaving(false);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const { url, error } = await uploadImage(file, "hero");
    if (url) {
      const maxOrder = images.reduce((m, i) => Math.max(m, i.display_order), -1);
      await addHeroImage({
        url,
        mobile_url: url,
        caption: "",
        display_order: maxOrder + 1,
        active: images.length === 0,
      });
      reloadImages();
    } else if (error) {
      alert(`Error al subir la imagen: ${error}`);
    }
    setUploading(false);
  };

  const move = async (id: string, dir: "up" | "down") => {
    await moveItem("hero_images", images, id, dir);
    reloadImages();
  };

  if (loading || !hero) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-foreground">Hero (portada)</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        El texto y la imagen de fondo que ven los visitantes al entrar al sitio.
      </p>

      <div className="mt-5 space-y-3 rounded-lg border border-border bg-white p-4">
        <Field label="Etiqueta (badge)" value={hero.brandLabel} onChange={(v) => setHero({ ...hero, brandLabel: v })} />
        <Field label="Título" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
        <Field
          label="Título destacado (color acento)"
          value={hero.titleHighlight}
          onChange={(v) => setHero({ ...hero, titleHighlight: v })}
        />
        <Field
          label="Subtítulo"
          value={hero.subtitle}
          onChange={(v) => setHero({ ...hero, subtitle: v })}
          textarea
        />
        <Field
          label="Texto botón planes"
          value={hero.ctaPlans}
          onChange={(v) => setHero({ ...hero, ctaPlans: v })}
        />
        <Field
          label="Texto botón cabañas"
          value={hero.ctaCabins}
          onChange={(v) => setHero({ ...hero, ctaCabins: v })}
        />
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar textos"}
        </Button>
      </div>

      <h2 className="mt-6 text-sm font-bold text-foreground">Imágenes de fondo</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        La primera imagen activa (arriba en la lista) es la que se usa como fondo del hero.
      </p>
      <div className="mt-2 divide-y divide-border rounded-lg border border-border bg-white">
        {images.map((img, i) => (
          <div key={img.id} className="flex items-center gap-3 px-4 py-3">
            <ReorderButtons
              onUp={() => move(img.id, "up")}
              onDown={() => move(img.id, "down")}
              disabledUp={i === 0}
              disabledDown={i === images.length - 1}
            />
            <img src={img.url} alt="" className="h-12 w-20 rounded object-cover" />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={img.active}
                onChange={(e) => {
                  updateHeroImage(img.id, { active: e.target.checked });
                  reloadImages();
                }}
              />
              Activa
            </label>
            <button
              type="button"
              onClick={() => {
                deleteHeroImage(img.id);
                reloadImages();
              }}
              className="ml-auto text-muted-foreground hover:text-red-600"
              aria-label="Eliminar"
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
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? "Subiendo…" : "Subir imagen"}
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}
