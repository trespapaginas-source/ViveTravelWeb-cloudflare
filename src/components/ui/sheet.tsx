import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Sheet — panel lateral modal (equivalente al de Radix usado en el original).
 * Implementación ligera: overlay + panel lateral animado.
 *
 * El contenido SOLO se renderiza en el DOM cuando el Sheet está abierto
 * (o durante la transición de cierre), evitando que ocupe espacio visual
 * o solape el contenido en desktop cuando está cerrado.
 */
interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const SheetContext = createContext<SheetContextValue | null>(null);

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) {
  const ctx = useContext(SheetContext);
  if (!ctx) return <>{children}</>;
  const handleClick = () => ctx.onOpenChange(true);

  if (asChild) {
    const child = children as ReactElement<{ onClick?: (e: unknown) => void }>;
    return cloneElement(child, {
      onClick: (e: unknown) => {
        handleClick();
        child.props.onClick?.(e);
      },
    });
  }
  return <span onClick={handleClick}>{children}</span>;
}

export function SheetTitle({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <span className={cn("sr-only", className)}>{children}</span>;
}

export function SheetContent({
  side = "right",
  className,
  children,
}: {
  side?: "left" | "right";
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(SheetContext);
  const [mounted, setMounted] = useState(false);
  // `render` controla si el portal está en el DOM. Permite mantener la
  // animación de salida: al cerrar, espera 300ms antes de desmontar.
  const [render, setRender] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!ctx) return;
    if (ctx.open) {
      // Abrir: montar inmediatamente y dejar que la transición lo lleve a visible.
      setRender(true);
    } else if (render) {
      // Cerrar: desmontar tras la duración de la animación (300ms).
      const t = setTimeout(() => setRender(false), 320);
      return () => clearTimeout(t);
    }
  }, [ctx, ctx?.open, render]);

  useEffect(() => {
    if (!ctx?.open || !render) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [ctx, ctx?.open, render]);

  // No renderizar nada si: no hay contexto, no hay montaje SSR, o está cerrado
  // y el retardo de animación ya expiró. Así el Sheet NUNCA ocupa espacio en
  // desktop cuando está cerrado.
  if (!ctx || !mounted || !render) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          ctx.open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => ctx.onOpenChange(false)}
      />
      <div
        className={cn(
          "absolute top-0 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-out",
          side === "right"
            ? "right-0 " + (ctx.open ? "translate-x-0" : "translate-x-full")
            : "left-0 " + (ctx.open ? "translate-x-0" : "-translate-x-full"),
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

