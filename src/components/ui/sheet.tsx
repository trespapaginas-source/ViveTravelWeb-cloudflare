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
 * Implementación ligera sin dependencias externas: overlay + panel lateral
 * animado con cierre por tecla Escape y click fuera.
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

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!ctx?.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [ctx]);

  if (!ctx || !mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100]",
        !ctx.open && "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          ctx.open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => ctx.onOpenChange(false)}
      />
      <div
        className={cn(
          "absolute top-0 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-out",
          side === "right"
            ? ctx.open
              ? "translate-x-0"
              : "translate-x-full"
            : ctx.open
            ? "translate-x-0"
            : "-translate-x-full",
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
