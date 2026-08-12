import { X, GripVertical } from "lucide-react";
import { useDragReorder } from "../lib/useDragReorder";
import { cn } from "@/lib/utils";

/** Lista de imágenes ya subidas — arrástralas para cambiar su posición. */
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
    <div className="mt-1 divide-y divide-border rounded-md border border-border">
      {images.map((url, i) => (
        <div
          key={i}
          {...dropTargetProps(i)}
          className={cn(
            "flex items-center gap-2 bg-white px-2 py-1.5 transition-opacity",
            isDragging(i) && "opacity-40",
            isOver(i) && "border-t-2 border-t-teal-500"
          )}
        >
          <span
            {...handleProps(i)}
            className="-m-2 flex shrink-0 cursor-grab items-center justify-center p-2 text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </span>
          <img src={url} alt="" className="h-14 w-20 shrink-0 rounded object-cover" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {i === 0 ? "Portada (posición 1)" : `Posición ${i + 1}`}
          </span>
          <button
            type="button"
            onClick={() => onChange(images.filter((_, idx) => idx !== i))}
            className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-red-600"
            aria-label="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
