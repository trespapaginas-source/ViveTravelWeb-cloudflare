import type { ReactNode } from "react";
import { useSiteContent } from "@/lib/use-site-content";
import { HeroSection } from "@/components/home/hero-section";
import { PromotionsBanner } from "@/components/home/promotions-banner";
import { TickerRibbon } from "@/components/home/ticker-ribbon";
import { FeaturedPlans } from "@/components/home/featured-plans";
import { ScheduledDeparturesBanner } from "@/components/home/scheduled-departures-banner";
import { ScheduledDepartures } from "@/components/home/scheduled-departures";
import { InternationalDestinations } from "@/components/home/international-destinations";
import { GroupTrips } from "@/components/home/group-trips";
import { Testimonials } from "@/components/home/testimonials";
import { ReadyCTA } from "@/components/home/ready-cta";

/**
 * HomePage — FASE 2.
 *
 * Compone las secciones del home según `content.homeConfig` (array `order` +
 * flags `active`), replicando el comportamiento config-driven del proyecto de
 * referencia. Cada clave del order se mapea a su componente en el registro.
 *
 * Secciones activas (site-content.json):
 *  hero, promotions, ticker, plans, bannerSalidas, salidas, international,
 *  groups, testimonials, readyCta
 * Inactivas: team, custom, gallery, influencer, stats (sin registro).
 */
export function HomePage() {
  const { content } = useSiteContent();
  const order: string[] = content.homeConfig?.order ?? [];
  const active: Record<string, boolean> = content.homeConfig?.active ?? {};

  // Registro de componentes por clave de sección.
  const componentsRegistry: Record<string, ReactNode | undefined> = {
    hero: <HeroSection key="hero" />,
    promotions: <PromotionsBanner key="promotions" />,
    ticker: <TickerRibbon key="ticker" />,
    plans: <FeaturedPlans key="plans" />,
    bannerSalidas: <ScheduledDeparturesBanner key="bannerSalidas" />,
    salidas: <ScheduledDepartures key="salidas" />,
    international: <InternationalDestinations key="international" />,
    groups: <GroupTrips key="groups" />,
    testimonials: <Testimonials key="testimonials" />,
    readyCta: <ReadyCTA key="readyCta" />,
    // Secciones presentes en `order` pero sin componente / inactivas:
    // stats (sin registro), gallery/custom/team/influencer (active:false)
  };

  return (
    <>
      {order.map((sectionKey) => {
        if (active[sectionKey] && componentsRegistry[sectionKey]) {
          return componentsRegistry[sectionKey];
        }
        return null;
      })}
    </>
  );
}
