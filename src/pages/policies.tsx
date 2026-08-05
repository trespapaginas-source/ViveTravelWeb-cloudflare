import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { legalDocsRaw } from "@/hooks/use-detail";
import { ROUTES } from "@/lib/routes";
import type { LegalDoc } from "@/lib/data";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Términos y contratación": <FileText className="h-5 w-5" />,
  "Reservas y cancelaciones": <ShieldCheck className="h-5 w-5" />,
  "Privacidad y datos": <ShieldCheck className="h-5 w-5" />,
  "Operación y responsabilidad": <ShieldCheck className="h-5 w-5" />,
};

/**
 * PoliciesPage — índice de documentos legales agrupados por categoría.
 */
export function PoliciesPage() {
  const docs = useMemo(
    () => [...legalDocsRaw].sort((a, b) => a.number.localeCompare(b.number)),
    []
  );

  // Agrupar por categoría.
  const grouped = useMemo(() => {
    return docs.reduce<Record<string, LegalDoc[]>>((acc, doc) => {
      (acc[doc.category] ??= []).push(doc);
      return acc;
    }, {});
  }, [docs]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-1 text-xs font-semibold text-neutral-900">
          <ShieldCheck className="h-4 w-4" /> Documentos Legales
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Marco Legal y Políticas
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Transparencia y confianza en cada reserva. Consulta nuestros términos,
          políticas y documentos regulatorios.
        </p>
      </div>

      {/* Documentos por categoría */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              <span className="text-neutral-900">
                {CATEGORY_ICONS[category] ?? <FileText className="h-5 w-5" />}
              </span>
              {category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((doc) => (
                <Link
                  key={doc.slug}
                  to={ROUTES.legalDoc(doc.slug)}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{doc.number}
                      </span>
                      <h3 className="line-clamp-1 text-sm font-semibold text-card-foreground group-hover:text-neutral-900">
                        {doc.shortTitle}
                      </h3>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {doc.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-neutral-900" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer corporativo */}
      <div className="mt-12 rounded-2xl bg-muted/50 p-6 text-center">
        <p className="text-sm font-medium text-foreground">
          Vive Group S.A.S. · NIT 901993710 · RNT 278488
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {docs.length} documentos · Última actualización:{" "}
          {docs[0]?.issuedAt ?? "2026"}
        </p>
      </div>
    </div>
  );
}
