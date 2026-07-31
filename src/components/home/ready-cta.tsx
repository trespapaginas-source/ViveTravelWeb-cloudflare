import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";
import { ROUTES } from "@/lib/routes";

/**
 * ReadyCTA — llamada a la acción final del home.
 * Lee content.customTrips (ctaTitle, ctaDescription, ctaContact, ctaPlans).
 */
export function ReadyCTA() {
  const { content } = useSiteContent();
  const c = content.customTrips;
  const navigate = useNavigate();

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-gray-50 p-8 lg:flex-row lg:justify-between lg:p-10">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {c.ctaTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {c.ctaDescription}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(ROUTES.contact)}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <MessageCircle className="h-4 w-4" />
              {c.ctaContact}
            </button>
            <button
              onClick={() => navigate(ROUTES.plans)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {c.ctaPlans} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
