import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * DropdownMenu — menú desplegable (equivalente ligero al de Radix del original).
 * Se abre al click, se cierra por click fuera o Escape.
 */
const DropdownCtx = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <DropdownCtx.Provider value={{ open, setOpen }}>
        {children}
      </DropdownCtx.Provider>
    </div>
  );
}

export function DropdownMenuTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) {
  const ctx = useContext(DropdownCtx);
  if (!ctx) return <>{children}</>;
  const toggle = () => ctx.setOpen(!ctx.open);

  if (asChild) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, {
      onClick: (e: unknown) => {
        toggle();
        (child.props.onClick as ((e: unknown) => void) | undefined)?.(e);
      },
      "aria-expanded": ctx.open,
    });
  }
  return (
    <button onClick={toggle} aria-expanded={ctx.open} type="button">
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  align = "center",
  className,
  children,
}: {
  align?: "start" | "center" | "end";
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(DropdownCtx);
  if (!ctx || !ctx.open) return null;
  const alignClass =
    align === "end"
      ? "right-0"
      : align === "start"
      ? "left-0"
      : "left-1/2 -translate-x-1/2";
  return (
    <div
      className={cn(
        "absolute top-full mt-1 z-50 min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
        alignClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  asChild,
  className,
  children,
}: {
  asChild?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(DropdownCtx);

  if (asChild) {
    const child = children as ReactElement<{
      onClick?: (e: unknown) => void;
      className?: string;
    }>;
    return cloneElement(child, {
      className: cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        child.props.className,
        className
      ),
      onClick: (e) => {
        ctx?.setOpen(false);
        child.props.onClick?.(e);
      },
    });
  }
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => ctx?.setOpen(false)}
    >
      {children}
    </div>
  );
}
