import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Arrastrar y soltar para reordenar un array local (imágenes, banners, etc.),
 * con Pointer Events — funciona igual con mouse, touch y lápiz (el Drag & Drop
 * nativo de HTML5 no dispara eventos en pantallas táctiles, por eso no se usa).
 *
 * El "agarre" (ícono) lleva `handleProps(index)`; la fila completa lleva
 * `dropTargetProps(index)` — así se puede seguir haciendo click/selección de
 * texto normal dentro de inputs de la fila sin disparar un arrastre accidental.
 */
export function useDragReorder<T>(items: T[], onChange: (next: T[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Refs para leer siempre el valor más reciente dentro de los listeners
  // globales, sin depender de closures que quedarían obsoletas entre renders.
  const dragIndexRef = useRef<number | null>(null);
  const overIndexRef = useRef<number | null>(null);
  const itemsRef = useRef(items);
  const onChangeRef = useRef(onChange);
  itemsRef.current = items;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (dragIndex === null) return;

    const handleMove = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const row = el?.closest<HTMLElement>("[data-drag-index]");
      if (!row) return;
      const idx = Number(row.dataset.dragIndex);
      if (!Number.isNaN(idx) && idx !== overIndexRef.current) {
        overIndexRef.current = idx;
        setOverIndex(idx);
      }
    };

    const finish = () => {
      const from = dragIndexRef.current;
      const to = overIndexRef.current;
      if (from !== null && to !== null && from !== to) {
        const next = [...itemsRef.current];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChangeRef.current(next);
      }
      dragIndexRef.current = null;
      overIndexRef.current = null;
      setDragIndex(null);
      setOverIndex(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [dragIndex]);

  const handleProps = (index: number) => ({
    onPointerDown: (e: ReactPointerEvent) => {
      e.preventDefault();
      dragIndexRef.current = index;
      overIndexRef.current = index;
      setDragIndex(index);
      setOverIndex(index);
    },
    // Evita que el navegador scrollee la página al arrastrar con el dedo.
    style: { touchAction: "none" as const },
  });

  const dropTargetProps = (index: number) => ({
    "data-drag-index": index,
  });

  return {
    handleProps,
    dropTargetProps,
    isDragging: (index: number) => dragIndex === index,
    isOver: (index: number) => overIndex === index && dragIndex !== index,
  };
}
