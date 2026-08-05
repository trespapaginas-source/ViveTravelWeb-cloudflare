import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dialog — modal custom (sin Radix), inspirado en el patrón del `sheet.tsx`
 * local. Reutiliza el mismo enfoque de portal + overlay + animación de
 * salida con retardo (320ms) y bloqueo de scroll del body.
 *
 * Visualmente replica el gemelo:
 *  - Móvil: bottom-sheet (`bottom-0 rounded-t-2xl`, desliza desde abajo).
 *  - Desktop (`sm+`): centrado (`top-1/2 -translate-y-1/2 rounded-2xl`).
 *
 * El contenido SOLO se monta cuando está abierto (o cerrando), evitando
 * que ocupe espacio o capture clicks cuando no es visible.
 */
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const DialogContext = createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-lg font-bold leading-tight tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(DialogContext);
  const [mounted, setMounted] = useState(false);
  // `render` controla si el portal está en el DOM (retardo para animación).
  const [render, setRender] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!ctx) return;
    if (ctx.open) {
      setRender(true);
    } else if (render) {
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

  if (!ctx || !mounted || !render) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          ctx.open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => ctx.onOpenChange(false)}
      />
      {/* Contenido: bottom-sheet en móvil, centrado en desktop */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full bg-white shadow-xl transition-all duration-300 ease-out",
          // Móvil: bottom-sheet
          "max-h-[92vh] overflow-y-auto rounded-t-2xl p-5",
          ctx.open
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0",
          // Desktop: centrado
          "sm:max-w-lg sm:rounded-2xl sm:p-6",
          ctx.open
            ? "sm:translate-y-0 sm:scale-100"
            : "sm:translate-y-4 sm:scale-95",
          className
        )}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={() => ctx.onOpenChange(false)}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
