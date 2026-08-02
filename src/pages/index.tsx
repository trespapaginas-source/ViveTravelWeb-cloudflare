import { PagePlaceholder } from "@/pages/page-placeholder";

// Páginas placeholder para las rutas que aún no tienen implementación real.
// (Plans, Cabins, Visas, Transports, PlanDetail, CabinDetail, Policies y
// LegalDoc ya tienen sus archivos propios.)

export const TransportDetailPage = () => (
  <PagePlaceholder
    eyebrow="Detalle de vehículo"
    title="Detalle del vehículo"
    description="Ficha del vehículo con características, capacidad y cotización. Se implementa en la siguiente fase."
  />
);

export const VisaDetailPage = () => (
  <PagePlaceholder
    eyebrow="Detalle de visa"
    title="Requisitos de visa"
    description="Requisitos, proceso, documentos y sede consular por país. Se implementa en la siguiente fase."
  />
);

export const ContactPage = () => (
  <PagePlaceholder
    eyebrow="Contacto"
    title="Contáctanos"
    description="Formulario de contacto y canales directos de atención (WhatsApp, email, redes). Se implementa en la siguiente fase."
  />
);

export const TeamPage = () => (
  <PagePlaceholder
    eyebrow="Equipo"
    title="Nuestro equipo"
    description="Los tres fundadores de Vive Travel. Se implementa en la siguiente fase."
  />
);

export const FavoritesPage = () => (
  <PagePlaceholder
    eyebrow="Tu colección"
    title="Mis favoritos"
    description="Planes y cabañas guardados (almacenamiento local). Se implementa en la siguiente fase."
  />
);

export const NotFoundPage = () => (
  <PagePlaceholder
    eyebrow="404"
    title="Página no encontrada"
    description="La ruta solicitada no existe. Verifica el enlace o vuelve al inicio."
  />
);
