import { useState } from "react";
import {
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";
import { openWhatsApp } from "@/lib/whatsapp";

const SUBJECTS = [
  { value: "plan_turistico", label: "Plan turístico" },
  { value: "alojamiento", label: "Alojamiento / Cabaña" },
  { value: "viaje_grupal", label: "Viaje grupal" },
  { value: "viaje_personalizado", label: "Viaje personalizado" },
  { value: "otro", label: "Otro" },
];

/**
 * ContactPage — formulario de contacto + canales directos de atención.
 */
export function ContactPage() {
  const { content } = useSiteContent();
  const c = content.contact;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0].value,
    message: "",
    contactMethod: "whatsapp",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construye un mensaje de WhatsApp con los datos del formulario.
    const subjectLabel =
      SUBJECTS.find((s) => s.value === form.subject)?.label ?? form.subject;
    const msg = [
      "👋 *NUEVA SOLICITUD DE CONTACTO - VIVE TRAVEL*",
      "",
      `👤 *Nombre:* ${form.name}`,
      `📧 *Email:* ${form.email}`,
      form.phone ? `📱 *Teléfono:* ${form.phone}` : "",
      `🎯 *Asunto:* ${subjectLabel}`,
      `📞 *Contactar por:* ${form.contactMethod}`,
      "",
      `💬 *Mensaje:*`,
      form.message,
    ]
      .filter(Boolean)
      .join("\n");

    openWhatsApp(msg);
    setSent(true);
  };

  const channels = [
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: c.whatsapp,
      sub: c.chatDescription,
      href: c.whatsappUrl,
      external: true,
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: c.email,
      sub: "Respuesta en menos de 24h",
      href: `mailto:${c.email}`,
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: c.location,
      sub: "Visítanos en oficina",
      href: "#",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Horario de atención",
      sub: c.hours,
      href: "#",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-ocean/10 px-4 py-1 text-xs font-semibold text-ocean">
          {c.badge}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {c.title} <span className="text-ocean">{c.titleHighlight}</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {c.subtitle}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Formulario */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-14 w-14 text-ocean" />
              <h2 className="mt-4 text-lg font-bold text-foreground">
                ¡Mensaje enviado!
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Abrimos WhatsApp con tu mensaje. Te responderemos a la brevedad.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-accent"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground">{c.formTitle}</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre completo *">
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Tu nombre"
                      className="input"
                    />
                  </Field>
                  <Field label="Email *">
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tucorreo@email.com"
                      className="input"
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Teléfono">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+57 300 000 0000"
                      className="input"
                    />
                  </Field>
                  <Field label="Asunto">
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="input"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Mensaje *">
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Cuéntanos qué tipo de experiencia buscas..."
                    className="input resize-none"
                  />
                </Field>
                <Field label="¿Cómo prefieres que te contactemos?">
                  <div className="flex gap-4">
                    {[
                      { id: "whatsapp", label: "WhatsApp" },
                      { id: "email", label: "Email" },
                      { id: "phone", label: "Llamada" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-1.5 text-sm"
                      >
                        <input
                          type="radio"
                          name="contactMethod"
                          value={opt.id}
                          checked={form.contactMethod === opt.id}
                          onChange={(e) =>
                            setForm({ ...form, contactMethod: e.target.value })
                          }
                          className="accent-ocean"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-ocean py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-dark"
                >
                  <Send className="h-4 w-4" /> Enviar mensaje
                </button>
              </form>
            </>
          )}
        </div>

        {/* Canales de atención */}
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {channels.map((ch, i) => (
              <a
                key={i}
                href={ch.href}
                target={ch.external ? "_blank" : undefined}
                rel={ch.external ? "noopener noreferrer" : undefined}
                className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-ocean"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10 text-ocean">
                  {ch.icon}
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{ch.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{ch.sub}</p>
              </a>
            ))}
          </div>

          {/* Redes sociales */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground">{c.socialLabel}</h3>
            <div className="mt-3 flex gap-2">
              {[
                { icon: Instagram, href: c.instagramUrl, label: "Instagram" },
                { icon: Facebook, href: c.facebookUrl, label: "Facebook" },
                {
                  icon: MessageCircle,
                  href: c.whatsappUrl,
                  label: "WhatsApp",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-ocean hover:text-ocean"
                  aria-label={s.label}
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* CTA WhatsApp directo */}
          <div className="mt-6 rounded-2xl bg-[#1DA851]/5 p-5 text-center">
            <p className="text-sm font-medium text-foreground">{c.chatTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.chatDescription}</p>
            <a
              href={c.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#1DA851] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#17943e]"
            >
              <MessageCircle className="h-4 w-4" /> {c.chatButton}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
