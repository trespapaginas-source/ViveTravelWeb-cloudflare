import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { StarRating, ratingLabel } from "./star-rating";
import { TURNSTILE_SITEKEY } from "@/lib/reviews-api";
import { cn } from "@/lib/utils";

const MAX_COMMENT_WORDS = 20;

/**
 * Cuenta las palabras del textarea en tiempo real.
 */
function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

/**
 * ReviewForm — formulario público para dejar una reseña.
 * Campos:
 *   · Nombre del cliente (input)
 *   · Valoración por estrellas (1-5) con etiqueta en vivo
 *   · Comentario (textarea opcional, máx 20 palabras)
 *
 * `serviceId` y `serviceType` se inyectan implícitamente desde el contexto
 * (route/estado), por eso no se piden aquí. Anti-spam: Turnstile embebido.
 *
 * El `onSubmit` recibe { reviewerName, rating, comment?, turnstileToken }
 * y debe devolver una Promise (la petición al backend).
 */
export function ReviewForm({
  onSubmit,
  formId,
}: {
  onSubmit: (data: {
    reviewerName: string;
    rating: number;
    comment?: string;
    turnstileToken: string;
  }) => Promise<unknown>;
  /** id del elemento scroll-target (para que la página pueda apuntar aquí). */
  formId?: string;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const commentWords = countWords(comment);
  const commentTooLong = commentWords > MAX_COMMENT_WORDS;

  // Renderiza el widget de Turnstile cuando hay sitekey y el contenedor existe.
  useEffect(() => {
    if (!TURNSTILE_SITEKEY || !turnstileRef.current) return;
    if (widgetId.current) return; // ya renderizado

    const tryRender = () => {
      const ts = (window as unknown as { turnstile?: { render: Function } }).turnstile;
      if (ts?.render && turnstileRef.current) {
        widgetId.current = ts.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITEKEY,
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          "error-callback": () => setTurnstileToken(null),
        }) as string;
      }
    };

    // El script de Turnstile se carga vía index.html; si aún no está listo, reintentar.
    tryRender();
    const interval = setInterval(() => {
      if (widgetId.current) {
        clearInterval(interval);
        return;
      }
      tryRender();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const resetTurnstile = () => {
    const ts = (window as unknown as { turnstile?: { reset: Function } }).turnstile;
    if (widgetId.current && ts?.reset) {
      ts.reset(widgetId.current);
    }
    setTurnstileToken(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    // Validaciones locales.
    if (name.trim().length < 2) {
      setErrorMsg("Escribe tu nombre (mínimo 2 caracteres).");
      setStatus("error");
      return;
    }
    if (commentTooLong) {
      setErrorMsg(`El comentario no puede exceder ${MAX_COMMENT_WORDS} palabras.`);
      setStatus("error");
      return;
    }
    if (TURNSTILE_SITEKEY && !turnstileToken) {
      setErrorMsg("Completa la verificación anti-spam.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      await onSubmit({
        reviewerName: name.trim(),
        rating,
        comment: comment.trim() ? comment.trim() : undefined,
        turnstileToken: turnstileToken ?? "",
      });
      setStatus("success");
      setName("");
      setComment("");
      setRating(5);
      resetTurnstile();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al enviar la reseña.");
      setStatus("error");
      resetTurnstile();
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-5 w-5 text-emerald-600" />
        </span>
        <p className="text-sm font-semibold text-foreground">¡Gracias por tu calificación!</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-1 text-xs font-medium text-neutral-600 underline hover:text-neutral-900"
        >
          Dejar otra reseña
        </button>
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="scroll-mt-24 space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <h3 className="text-sm font-bold text-foreground">Califica esta experiencia</h3>

      {/* Nombre */}
      <div>
        <label htmlFor="rev-name" className="mb-1 block text-xs font-medium text-gray-600">
          Tu nombre
        </label>
        <input
          id="rev-name"
          type="text"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: María González"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-neutral-900"
          disabled={status === "loading"}
        />
      </div>

      {/* Estrellas + etiqueta en vivo */}
      <div>
        <span className="mb-1 block text-xs font-medium text-gray-600">Tu calificación</span>
        <div className="flex flex-wrap items-center gap-3">
          <StarRating value={rating} onChange={setRating} size="lg" />
          <span className="text-sm font-semibold text-foreground">
            {ratingLabel(rating)}
          </span>
        </div>
      </div>

      {/* Comentario opcional (máx 20 palabras) */}
      <div>
        <label htmlFor="rev-comment" className="mb-1 block text-xs font-medium text-gray-600">
          Comentario <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          id="rev-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={200}
          placeholder="Cuéntanos en pocas palabras cómo fue tu experiencia (máx. 20 palabras)"
          className={cn(
            "w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-neutral-900",
            commentTooLong ? "border-red-400" : "border-border"
          )}
          disabled={status === "loading"}
        />
        <div className="mt-1 flex justify-end">
          <span
            className={cn(
              "text-[11px]",
              commentTooLong ? "font-semibold text-red-500" : "text-muted-foreground"
            )}
          >
            {commentWords}/{MAX_COMMENT_WORDS} palabras
          </span>
        </div>
      </div>

      {/* Widget Turnstile (solo si hay sitekey configurado) */}
      {TURNSTILE_SITEKEY && (
        <div ref={turnstileRef} className="min-h-[65px]" />
      )}

      {errorMsg && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
        )}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          "Enviar calificación"
        )}
      </button>
    </form>
  );
}
