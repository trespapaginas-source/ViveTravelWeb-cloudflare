import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EXPERIENCE_SECTIONS } from "@/lib/experience-sections";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/lib/use-site-content";
import { ChevronDown, Menu, Phone, Heart, X } from "lucide-react";

const LOGO_FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80";

/** Mapa clave-de-item → prefijo de ruta, para determinar el estado activo. */
const ROUTE_PREFIX: Record<string, string> = {
  home: "/",
  plans: "/planes",
  cabins: "/cabanas",
  transports: "/transporte",
  visas: "/visas",
  team: "/equipo",
  contact: "/contacto",
  policies: "/politicas",
  favorites: "/favoritos",
};

/** Indica si un item de navegación está activo según la ruta actual. */
function isItemActive(key: string, pathname: string): boolean {
  const prefix = ROUTE_PREFIX[key];
  if (!prefix) return false;
  if (prefix === "/") return pathname === "/";
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function Navbar() {
  const { content } = useSiteContent();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [experiencesOpen, setExperiencesOpen] = useState(false);
  const { pathname } = useLocation();

  const isHome = pathname === "/";
  const showOpaque = scrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobile = () =>
    requestAnimationFrame(() => setMobileOpen(false));

  const isFav = pathname === ROUTES.favorites;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-200 border-b border-transparent",
        showOpaque
          ? "bg-white/80 backdrop-blur-lg border-zinc-100/80 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]"
          : "bg-transparent"
      )}
    >
      {/* Campaign banner */}
      {content.campaign?.active && isHome && (
        <div
          className={cn(
            "bg-neutral-900 text-white text-center text-xs font-semibold transition-all duration-200 ease-in-out overflow-hidden relative z-50 flex items-center justify-center",
            scrolled ? "h-0 opacity-0" : "h-[36px] opacity-100"
          )}
        >
          <div className="py-2.5 px-4">
            {content.campaign.bannerText}{" "}
            <span className="underline ml-1 cursor-pointer hover:text-white/90">
              {content.campaign.ctaText}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-300",
            scrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
          )}
        >
          {/* Logo dual (color / blanco) con crossfade */}
          <Link
            to={ROUTES.home}
            onClick={closeMobile}
            className="flex items-center group relative cursor-pointer"
          >
            <img
              src="/logos/vive-travel-original.png"
              alt="Vive Travel"
              width={120}
              height={48}
              className={cn(
                "h-10 sm:h-12 w-auto transition-opacity duration-300",
                showOpaque ? "opacity-100" : "opacity-0"
              )}
              onError={(e) => {
                e.currentTarget.src = LOGO_FALLBACK;
                e.currentTarget.onerror = null;
              }}
            />
            <img
              src="/logos/vive-travel-white.png"
              alt="Vive Travel"
              width={120}
              height={48}
              className={cn(
                "absolute inset-0 h-10 sm:h-12 w-auto transition-opacity duration-300",
                showOpaque ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
              onError={(e) => {
                e.currentTarget.src = LOGO_FALLBACK;
                e.currentTarget.onerror = null;
              }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {content.navbar.navItems.map((item) => {
              const active = isItemActive(item.key, pathname);

              if (item.key === "plans") {
                return (
                  <div
                    key="plans"
                    className={cn(
                      "relative flex items-center rounded-full transition-all duration-200",
                      active
                        ? showOpaque
                          ? "bg-zinc-900 text-white shadow-sm"
                          : "bg-white/20 backdrop-blur-sm text-white"
                        : showOpaque
                        ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Link
                      to={ROUTES.plans}
                      onClick={closeMobile}
                      className="pl-3.5 pr-1 py-2 text-sm font-medium flex items-center gap-1 hover:opacity-90"
                    >
                      {item.label}
                    </Link>

                    {/* Megamenú de las 6 categorías de experiencias */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="pr-3 pl-0.5 py-2 text-sm font-medium cursor-pointer border-none bg-transparent flex items-center hover:opacity-90"
                          aria-label="Opciones de experiencias"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="min-w-52">
                        {EXPERIENCE_SECTIONS.map((section) => (
                          <DropdownMenuItem asChild key={section.id}>
                            <Link
                              to={ROUTES.plansByCategory(section.id)}
                              onClick={closeMobile}
                              className="w-full cursor-pointer"
                            >
                              {section.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              }

              return (
                <Link
                  key={item.key}
                  to={ROUTE_PREFIX[item.key] ?? ROUTES.home}
                  onClick={closeMobile}
                  className={cn(
                    "px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    active
                      ? showOpaque
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "bg-white/20 backdrop-blur-sm text-white"
                      : showOpaque
                      ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + Favorites + Mobile */}
          <div className="flex items-center gap-2">
            {/* Favorites */}
            <Link
              to={ROUTES.favorites}
              onClick={closeMobile}
              className={cn(
                "rounded-full h-10 w-10 sm:h-9 sm:w-9 flex items-center justify-center transition-colors duration-200",
                isFav
                  ? showOpaque
                    ? "bg-neutral-100 text-neutral-900 font-semibold"
                    : "bg-white/20 text-white"
                  : showOpaque
                  ? "text-zinc-600 hover:text-neutral-900 hover:bg-neutral-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
              aria-label="Mis favoritos"
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  isFav && "fill-current"
                )}
              />
            </Link>

            {/* Reservar CTA */}
            <Button
              asChild
              className={cn(
                "hidden sm:flex items-center gap-2 rounded-full transition-colors duration-200 font-medium px-5",
                showOpaque
                  ? "bg-zinc-900 hover:bg-black text-white shadow-sm"
                  : "bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm"
              )}
            >
              <Link to={ROUTES.contact} onClick={closeMobile}>
                <Phone className="w-4 h-4" />
                {content.navbar.ctaButton}
              </Link>
            </Button>

            {/* Mobile menu (Sheet lateral derecho) */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "md:hidden h-10 w-10 hover:bg-transparent",
                    showOpaque ? "text-zinc-800" : "text-white"
                  )}
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetTitle>Menú de navegación</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <img
                      src="/logos/vive-travel-original.png"
                      alt="Vive Travel"
                      width={90}
                      height={36}
                      className="h-9 w-auto"
                      onError={(e) => {
                        e.currentTarget.src = LOGO_FALLBACK;
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <button
                      onClick={closeMobile}
                      aria-label="Cerrar menú"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-neutral-900"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <nav className="flex flex-col p-4 gap-1 overflow-y-auto">
                    {content.navbar.navItems.map((item) => {
                      const active = isItemActive(item.key, pathname);

                      if (item.key === "plans") {
                        return (
                          <div key="plans" className="flex flex-col">
                            <div
                              className={cn(
                                "flex items-center justify-between w-full rounded-xl transition-colors duration-150 min-h-[44px]",
                                active
                                  ? "bg-neutral-100 text-neutral-900 font-semibold"
                                  : "text-zinc-600 hover:bg-zinc-50 hover:text-neutral-900"
                              )}
                            >
                              <Link
                                to={ROUTES.plans}
                                onClick={closeMobile}
                                className="flex-1 px-4 py-3 text-left text-sm font-medium flex items-center"
                              >
                                {item.label}
                              </Link>
                              <button
                                onClick={() =>
                                  setExperiencesOpen((o) => !o)
                                }
                                className="px-3 py-3 text-sm font-medium flex items-center justify-center cursor-pointer"
                                aria-expanded={experiencesOpen}
                                aria-label="Desplegar experiencias"
                              >
                                <ChevronDown
                                  className={cn(
                                    "w-4 h-4 shrink-0 transition-transform duration-200",
                                    experiencesOpen && "rotate-180"
                                  )}
                                />
                              </button>
                            </div>
                            {/* Acordeón de las 6 categorías */}
                            <div
                              className={cn(
                                "grid transition-all duration-200 ease-out",
                                experiencesOpen
                                  ? "grid-rows-[1fr] opacity-100 mt-1"
                                  : "grid-rows-[0fr] opacity-0"
                              )}
                            >
                              <div className="overflow-hidden flex flex-col gap-0.5 pl-3">
                                {EXPERIENCE_SECTIONS.map((section) => (
                                  <Link
                                    key={section.id}
                                    to={ROUTES.plansByCategory(section.id)}
                                    onClick={closeMobile}
                                    className="px-4 py-2.5 rounded-lg text-left text-sm transition-colors duration-150 min-h-[40px] flex items-center text-zinc-500 hover:bg-zinc-50 hover:text-neutral-900"
                                  >
                                    {section.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={item.key}
                          to={ROUTE_PREFIX[item.key] ?? ROUTES.home}
                          onClick={closeMobile}
                          className={cn(
                            "px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors duration-150 min-h-[44px] flex items-center",
                            active
                              ? "bg-neutral-100 text-neutral-900 font-semibold"
                              : "text-zinc-600 hover:bg-zinc-50 hover:text-neutral-900"
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}

                    <div className="h-px bg-zinc-100 my-2" />

                    <Link
                      to={ROUTES.favorites}
                      onClick={closeMobile}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors duration-150 min-h-[44px]",
                        isFav
                          ? "bg-neutral-100 text-neutral-900 font-semibold"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-neutral-900"
                      )}
                    >
                      <Heart
                        className={cn("w-4 h-4", isFav && "fill-current")}
                      />
                      Mi Colección
                    </Link>
                  </nav>
                  <div className="mt-auto p-4 border-t">
                    <Button
                      asChild
                      className="w-full bg-zinc-900 hover:bg-black text-white rounded-xl h-11 font-semibold"
                    >
                      <Link to={ROUTES.contact} onClick={closeMobile}>
                        <Phone className="w-4 h-4 mr-2" />
                        {content.navbar.ctaButtonMobile}
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
