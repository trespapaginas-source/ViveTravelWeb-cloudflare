import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accordion — implementación ligera (sin Radix) con el mismo patrón visual
 * del proyecto gemelo. Soporta `type="single"` con `collapsible` y un
 * `defaultValue` para tener un ítem abierto al montar.
 *
 * Estado controlado internamente (no requiere estado en el padre).
 * Cada AccordionItem expone su `value` + `isOpen` vía contexto, y el
 * AccordionTrigger los consume para togglear sin que el caller pase callbacks.
 */

interface AccordionContextValue {
  value: string;
  toggle: (v: string) => void;
}
const AccordionContext = createContext<AccordionContextValue | null>(null);

export function Accordion({
  type = "single",
  collapsible = false,
  defaultValue,
  className,
  children,
}: {
  type?: "single";
  collapsible?: boolean;
  defaultValue?: string;
  className?: string;
  children: ReactNode;
}) {
  const [value, setValue] = useState<string>(defaultValue ?? "");

  const toggle = (v: string) => {
    if (type !== "single") return;
    if (value === v) {
      if (collapsible) setValue("");
    } else {
      setValue(v);
    }
  };

  return (
    <AccordionContext.Provider value={{ value, toggle }}>
      <div className={cn("divide-y border-y border-border", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  toggle: () => void;
}
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
);

export function AccordionItem({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) return <>{children}</>;
  const isOpen = ctx.value === value;

  return (
    <AccordionItemContext.Provider
      value={{ value, isOpen, toggle: () => ctx.toggle(value) }}
    >
      <div className={cn(className)} data-state={isOpen ? "open" : "closed"}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const itemCtx = useContext(AccordionItemContext);
  if (!itemCtx) return <>{children}</>;
  const { isOpen, toggle } = itemCtx;

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between gap-3 py-4 text-left text-sm transition-colors",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

export function AccordionContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const itemCtx = useContext(AccordionItemContext);
  const isOpen = itemCtx?.isOpen ?? false;

  return (
    <div
      className={cn(
        "grid overflow-hidden transition-all duration-200 ease-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}
