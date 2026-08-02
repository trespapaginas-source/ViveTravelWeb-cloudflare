import { useParams } from "react-router-dom";
import { useGoBack } from "@/hooks/use-go-back";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  ListChecks,
  ExternalLink,
  Info,
  Building2,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { useVisaDetail } from "@/hooks/use-detail";
import { ROUTES } from "@/lib/routes";
import { EmptyState } from "@/components/shared/empty-state";

/** Color de badge según categoría de visa. */
const CATEGORY_STYLE: Record<string, string> = {
  free: "bg-emerald-100 text-emerald-700",
  onarrival: "bg-amber-100 text-amber-700",
  required: "bg-rose-100 text-rose-700",
};

const CATEGORY_LABEL: Record<string, string> = {
  free: "Sin visa",
  onarrival: "A la llegada / electrónica",
  required: "Visa requerida",
};

/**
 * VisaDetailPage — requisitos migratorios de un país.
 * Consume los datos vía `useVisaDetail(slug)`.
 */
export function VisaDetailPage() {
  const { country: slug } = useParams<{ country: string }>();
  const { data: visa, notFound } = useVisaDetail(slug);
  const goBack = useGoBack(ROUTES.visas);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="País no encontrado"
          description="No tenemos información de visa para este destino."
        />
      </div>
    );
  }
  if (!visa) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <button
        onClick={goBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      {/* Header */}
      <header className="mt-4 flex flex-wrap items-center gap-4 border-b border-border pb-6">
        <img
          src={`https://flagcdn.com/w160/${visa.countryCode.toLowerCase()}.png`}
          alt={visa.country}
          className="h-20 w-20 rounded-xl object-cover ring-1 ring-border"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {visa.country}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                CATEGORY_STYLE[visa.categoryId] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {CATEGORY_LABEL[visa.categoryId] ?? visa.visaCategory}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{visa.region}</p>
        </div>
      </header>

      {/* Resumen */}
      <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5">
        <p className="text-sm text-foreground">{visa.summary}</p>
      </div>

      {/* Quick facts */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FactCard icon={<Clock className="h-5 w-5" />} label="Estadía" value={visa.stayDuration} />
        <FactCard icon={<DollarSign className="h-5 w-5" />} label="Costo" value={visa.cost} />
        <FactCard icon={<Clock className="h-5 w-5" />} label="Procesamiento" value={visa.processingTime} />
        <FactCard icon={<MapPin className="h-5 w-5" />} label="Dónde tramitar" value={visa.whereToApply} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Requisitos */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ListChecks className="h-5 w-5 text-ocean" /> Requisitos
          </h2>
          <ul className="mt-3 space-y-2">
            {visa.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-foreground">{req}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Paso a paso */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <FileText className="h-5 w-5 text-ocean" /> Paso a paso
          </h2>
          <ol className="mt-3 space-y-3">
            {visa.process.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Casos especiales */}
      {visa.specialNotes && visa.specialNotes.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Info className="h-5 w-5 text-ocean" /> Casos especiales
          </h2>
          <div className="mt-3 space-y-2">
            {visa.specialNotes.map((note, i) => (
              <div
                key={i}
                className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
              >
                {note}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sede consular */}
      {visa.embassyInfo && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Building2 className="h-5 w-5 text-ocean" /> Sede consular
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <p className="font-semibold text-foreground">Dirección</p>
              <p className="mt-1 text-muted-foreground">{visa.embassyInfo.address}</p>
            </div>
            {visa.embassyInfo.phone && (
              <div className="rounded-xl border border-border bg-card p-4 text-sm">
                <p className="font-semibold text-foreground">Teléfono</p>
                <p className="mt-1 text-muted-foreground">{visa.embassyInfo.phone}</p>
              </div>
            )}
            {visa.embassyInfo.cas && (
              <div className="rounded-xl border border-border bg-card p-4 text-sm">
                <p className="font-semibold text-foreground">Centro de solicitud (CAS)</p>
                <p className="mt-1 text-muted-foreground">{visa.embassyInfo.cas}</p>
              </div>
            )}
            <a
              href={visa.embassyInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-ocean"
            >
              <ExternalLink className="h-4 w-4 text-ocean" />
              <span className="font-semibold text-foreground">Sitio web oficial</span>
            </a>
          </div>
        </section>
      )}

      {/* Documentos */}
      {visa.documents && visa.documents.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <FileText className="h-5 w-5 text-ocean" /> Documentos requeridos
          </h2>
          <ul className="mt-3 space-y-2">
            {visa.documents.map((doc, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{doc}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recomendaciones */}
      {visa.tips.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Lightbulb className="h-5 w-5 text-ocean" /> Recomendaciones
          </h2>
          <ul className="mt-3 space-y-2">
            {visa.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span className="text-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Link oficial */}
      <div className="mt-8 rounded-2xl bg-ocean/5 p-5 text-center">
        <a
          href={visa.officialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ocean hover:underline"
        >
          <ExternalLink className="h-4 w-4" /> Consultar fuente oficial
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          Última actualización: {visa.lastUpdated}
        </p>
      </div>
    </div>
  );
}

function FactCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-ocean">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
