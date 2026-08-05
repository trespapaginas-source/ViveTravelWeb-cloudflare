import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  eyebrow?: string;
  align?: "center" | "left";
  className?: string;
}

/**
 * Cabecera de sección reutilizable: eyebrow opcional + título (con span
 * destacado) + subtítulo. Equivalente al `SectionHeader` del proyecto original.
 */
export function SectionHeader({
  title,
  titleHighlight,
  subtitle,
  eyebrow,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-neutral-900">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}{" "}
        {titleHighlight && <span className="text-neutral-900">{titleHighlight}</span>}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}
