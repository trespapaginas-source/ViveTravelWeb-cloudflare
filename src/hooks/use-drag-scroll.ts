import { useRef, useCallback, type MouseEvent } from "react";

/**
 * Hook de scroll arrastrable para contenedores horizontales (tabs, carruseles).
 * Permite arrastrar con el mouse para desplazar horizontalmente, al estilo del
 * `useDragScroll` del proyecto de referencia.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const moved = useRef(false);

  const onMouseDown = useCallback((e: MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    isDown.current = true;
    moved.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: MouseEvent<T>) => {
    const el = ref.current;
    if (!el || !isDown.current) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 4) moved.current = true;
    el.scrollLeft = scrollLeft.current - walk;
  }, []);

  const stopDrag = useCallback(() => {
    isDown.current = false;
  }, []);

  /**
   * Evita el click tras arrastrar (para que no se dispare un click accidental
   * sobre un item al soltar el mouse).
   */
  const onClickCapture = useCallback((e: MouseEvent<T>) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp: stopDrag,
    onMouseLeave: stopDrag,
    onClickCapture,
  };
}
