import { X, GripVertical } from "lucide-react";
import { useDragReorder } from "../lib/useDragReorder";
import { cn } from "@/lib/utils";

/** Grid de imágenes ya subidas — arrástralas para cambiar su posición. */
export function ImageReorderList({
  images,
  onChange,
}: {
  images: string[];
  onChange: (v: string[]) => void;
}) {
  const { handleProps, dropTargetProps, isDragging, isOver } = useDragReorder(images, onChange);

  if (images.length === 0) return null;

  return (
    <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((url, i) => (
        <div
          key={i}
          {...dropTargetProps(i)}
          className={cn(
            "group relative overflow-hidden rounded-lg border border-border bg-white transition-opacity",
            isDragging(i) && "opacity-40",
            isOver(i) && "ring-2 ring-teal-500"
          )}
        >
          <img src={url} alt="" className="aspect-square w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <span
            {...handleProps(i)}
            className="pointer-events-auto absolute left-1.5 top-1.5 flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </span>

          <button
            type="button"
            onClick={() => onChange(images.filter((_, idx) => idx !== i))}
            className="pointer-events-auto absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white hover:bg-red-600"
            aria-label="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-[11px] font-medium text-white">
            {i === 0 ? "Portada" : `Posición ${i + 1}`}
          </span>
        </div>
      ))}
    </div>
  );
}
