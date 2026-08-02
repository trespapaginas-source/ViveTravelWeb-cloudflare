import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";
import { ROUTES } from "@/lib/routes";

const TEAM_MEMBERS = [
  {
    name: "Andrés Trespalacios",
    role: "Co-fundador & Director Comercial",
    bio: "Apasionado por conectar a los viajeros con la esencia del Caribe colombiano. Lidera la estrategia comercial y las alianzas estratégicas de la agencia.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&q=80",
  },
  {
    name: "Luis Méndez",
    role: "Co-fundador & Vocero Principal",
    bio: "Viajero empedernido y vocero de Vive Travel. Recorre cada destino en primera persona para garantizar calidad, seguridad y experiencias memorables.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=750&fit=crop&q=80",
    featured: true,
  },
  {
    name: "Jean Fontalo",
    role: "Co-fundador & Director de Operaciones",
    bio: "Detrás de cada logística impecable. Asegura que cada viaje se ejecute con precisión, desde el transporte hasta el último detalle operativo.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=750&fit=crop&q=80",
  },
];

const STATS = [
  { value: "3", label: "Fundadores" },
  { value: "500+", label: "Viajeros felices" },
  { value: "15+", label: "Destinos" },
  { value: "4.9★", label: "Calificación" },
];

/**
 * TeamPage — los tres fundadores de Vive Travel.
 */
export function TeamPage() {
  const { content } = useSiteContent();
  const t = content.team;
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean/10 px-4 py-1 text-xs font-semibold text-ocean">
          <Users className="h-4 w-4" /> {content.navbar.navItems.find((n) => n.key === "team")?.label ?? "Equipo"}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          {t.description}
        </p>
      </div>

      {/* Grid de miembros */}
      <div className="grid gap-6 md:grid-cols-3">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.name}
            className={
              "flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md " +
              (member.featured ? "border-ocean ring-1 ring-ocean/20" : "border-border")
            }
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=750&fit=crop";
                }}
              />
              {member.featured && (
                <span className="absolute left-3 top-3 rounded-full bg-ocean px-3 py-1 text-xs font-semibold text-white">
                  Vocero Principal
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-base font-bold text-foreground">{member.name}</h3>
              <p className="text-sm font-medium text-ocean">{member.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-muted/30 p-5 text-center"
          >
            <p className="text-2xl font-extrabold text-ocean">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => navigate(ROUTES.plans)}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black"
        >
          Ver catálogo de planes <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate(ROUTES.contact)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
        >
          Contactar al equipo
        </button>
      </div>
    </div>
  );
}
