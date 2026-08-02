import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  Calendar,
} from "lucide-react";
import { useLegalDocs } from "@/hooks/use-detail";
import { ROUTES } from "@/lib/routes";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * LegalDocPage — renderiza un documento legal con sus cláusulas.
 * Consume los datos vía `useLegalDocs(slug)`.
 */
export function LegalDocPage() {
  const { doc: slug } = useParams<{ doc: string }>();
  const { data: doc, prev, next, notFound } = useLegalDocs(slug);
  const [activeClause, setActiveClause] = useState<number | null>(null);
  const [showTop, setShowTop] = useState(false);

  // Scroll-spy: detecta la cláusula activa.
  useEffect(() => {
    if (!doc) return;
    const onScroll = () => {
      setShowTop(window.scrollY > 500);
      for (const clause of doc.clauses) {
        const el = document.getElementById(`clausula-${clause.number}`);
        if (el && el.getBoundingClientRect().top < 160) {
          setActiveClause(clause.number);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [doc]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Documento no encontrado"
          description="El documento legal solicitado no existe."
        />
      </div>
    );
  }
  if (!doc) return null;

  const scrollToClause = (n: number) => {
    document
      .getElementById(`clausula-${n}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        to={ROUTES.policies}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Documentos legales
      </Link>

      {/* Header */}
      <header className="mt-4 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{doc.category}</span>
          <span className="text-border">•</span>
          <span className="font-mono">Doc #{doc.number}</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {doc.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {doc.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3 w-3" /> Versión {doc.version} · {doc.issuedAt}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <FileText className="h-3 w-3" /> {doc.clauses.length} cláusulas
          </span>
        </div>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        {/* Índice / TOC (desktop) */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-bold text-foreground">
              Índice de Cláusulas
            </h2>
            <nav className="max-h-[65vh] space-y-0.5 overflow-y-auto">
              {doc.clauses.map((clause) => (
                <button
                  key={clause.number}
                  onClick={() => scrollToClause(clause.number)}
                  className={
                    "block w-full border-l-2 py-1.5 pl-3 text-left text-xs transition-colors " +
                    (activeClause === clause.number
                      ? "border-ocean bg-muted/60 font-semibold text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted/40")
                  }
                >
                  <span className="font-mono">{clause.number}.</span> {clause.heading}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Cláusulas */}
        <div className="lg:col-span-8">
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {doc.clauses.map((clause) => (
              <section
                key={clause.number}
                id={`clausula-${clause.number}`}
                className="scroll-mt-24 p-6"
              >
                <h2 className="text-base font-bold text-foreground">
                  <span className="font-mono text-ocean">
                    Cláusula {clause.number}.
                  </span>{" "}
                  {clause.heading}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {clause.body}
                </p>
              </section>
            ))}
          </div>

          {/* Prev / Next */}
          <nav className="mt-6 grid grid-cols-2 gap-4">
            {prev ? (
              <Link
                to={ROUTES.legalDoc(prev.slug)}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-ocean"
              >
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ArrowLeft className="h-3 w-3" /> Anterior
                </span>
                <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">
                  {prev.shortTitle}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={ROUTES.legalDoc(next.slug)}
                className="rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-ocean"
              >
                <span className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
                  Siguiente <ChevronRight className="h-3 w-3" />
                </span>
                <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">
                  {next.shortTitle}
                </p>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </div>

      {/* Botón volver arriba */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg"
          aria-label="Volver arriba"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
