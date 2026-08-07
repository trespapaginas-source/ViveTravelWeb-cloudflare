-- 0003: Agrega `country` (código ISO 3166-1 alpha-2, ej. "CO", "US") a reviews.
-- Se captura automáticamente del lado del servidor vía request.cf.country
-- (Cloudflare ya geolocaliza cada request por IP, sin necesidad de un
-- servicio externo). Nullable: si Cloudflare no puede determinarlo, queda NULL
-- y el frontend simplemente no muestra bandera.
--
-- Aplicar con:
--   npx wrangler d1 execute vive-travel-reviews --remote --file=migrations/0003_reviews_country.sql

ALTER TABLE reviews ADD COLUMN country TEXT;
