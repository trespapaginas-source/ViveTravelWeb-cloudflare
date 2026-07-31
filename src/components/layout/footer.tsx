import { Link, useLocation } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";
import { ROUTES, LEGAL_DOC_SLUGS } from "@/lib/routes";

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.83V7.62a6.34 6.34 0 0 0-5.83 6.32 6.34 6.34 0 0 0 10.74 4.54A6.29 6.29 0 0 0 15.82 14V8.37a8.28 8.28 0 0 0 3.77.92v-2.6z" />
    </svg>
  );
}

const EXPLORE_LINKS = [
  { label: "Experiencias y viajes", href: ROUTES.plans },
  { label: "Cabañas", href: ROUTES.cabins },
  { label: "Transporte", href: ROUTES.transports },
  { label: "Visas y requisitos", href: ROUTES.visas },
  { label: "Nuestro equipo", href: ROUTES.team },
];

const LEGAL_LINKS = [
  { label: "Términos y condiciones", slug: LEGAL_DOC_SLUGS.terminos },
  { label: "Política de privacidad", slug: LEGAL_DOC_SLUGS.privacidad },
  { label: "Tratamiento de datos", slug: LEGAL_DOC_SLUGS.datos },
  { label: "Política de cookies", slug: LEGAL_DOC_SLUGS.cookies },
  { label: "Reservas y cancelaciones", slug: LEGAL_DOC_SLUGS.reservas },
];

const SUPPORT_LINKS = [
  { label: "Contacto", href: ROUTES.contact },
  { label: "PQR y sugerencias", href: ROUTES.legalDoc(LEGAL_DOC_SLUGS.pqr) },
  {
    label: "Manual del viajero",
    href: ROUTES.legalDoc(LEGAL_DOC_SLUGS.manualViajero),
  },
];

const LOGO_FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80";

export function Footer() {
  const { content } = useSiteContent();
  const f = content.footer;
  const { pathname } = useLocation();

  // Oculto en páginas de detalle (como en el original).
  const isDetail =
    pathname.startsWith("/planes/") || pathname.startsWith("/cabanas/");
  if (isDetail) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#090E1A] text-slate-300 mt-auto border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 border-b border-slate-800/80 items-start">
          {/* Marca + redes */}
          <div className="lg:col-span-4 space-y-4">
            <Link to={ROUTES.home} className="inline-block">
              <img
                src="/logos/vive-travel-white.png"
                alt={f.brandName}
                className="h-16 sm:h-20 lg:h-22 w-auto object-contain select-none"
                onError={(e) => {
                  e.currentTarget.src = LOGO_FALLBACK;
                  e.currentTarget.onerror = null;
                }}
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-sm">
              {f.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[
                {
                  icon: Instagram,
                  href: f.instagramUrl,
                  label: "Instagram",
                },
                { icon: Facebook, href: f.facebookUrl, label: "Facebook" },
                {
                  icon: TikTokIcon,
                  href: f.tiktokUrl || "https://www.tiktok.com/@vivetravelcol",
                  label: "TikTok",
                },
                { icon: MessageCircle, href: f.whatsappUrl, label: "WhatsApp" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label={social.label}
                  target={
                    social.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explorar + Legal */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Explorar
              </h3>
              <ul className="space-y-2 text-xs">
                {EXPLORE_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Legal
              </h3>
              <ul className="space-y-2 text-xs">
                {LEGAL_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={ROUTES.legalDoc(item.slug)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Soporte + Contacto */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Soporte
              </h3>
              <ul className="space-y-2 text-xs">
                {SUPPORT_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Contacto
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a
                    href={`tel:${f.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
                    <span>{f.phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${f.email}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
                    <span className="break-all">{f.email}</span>
                  </a>
                </li>
                <li className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <span>{f.location}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Barra inferior: identidad corporativa */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-slate-400">
            <span className="font-semibold text-slate-200">
              © {year} Vive Travel.
            </span>
            <span>Todos los derechos reservados.</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="font-medium text-slate-300">Vive Group S.A.S.</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="font-semibold text-emerald-400">NIT 901993710</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="font-semibold text-emerald-400">RNT 278488</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to={ROUTES.policies}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Documentos legales</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
