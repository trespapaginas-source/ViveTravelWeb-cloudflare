-- 0002: Refactor del sistema de reseñas.
-- Cambios:
--   · `destination` pasa a ser opcional (nullable) — ya no se pide en el form
--     porque es redundante con el contexto del servicio.
--   · Añade `comment` (texto corto, validado a máx 20 palabras en la API).
--
-- Estrategia no destructiva: reconstruye la tabla preservando los datos
-- existentes (SQLite no permite alterar constraints con ALTER suelto).
--
-- Aplicar con:
--   npx wrangler d1 execute vive-travel-reviews --remote --file=migrations/0002_reviews_comment.sql

CREATE TABLE IF NOT EXISTS reviews_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type TEXT NOT NULL CHECK(service_type IN ('plan', 'cabin')),
  service_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  destination TEXT,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT
);

-- Copia datos existentes (comment queda NULL en históricos).
INSERT INTO reviews_new (id, service_type, service_id, reviewer_name, destination, rating, created_at, ip_hash)
SELECT id, service_type, service_id, reviewer_name, destination, rating, created_at, ip_hash
FROM reviews;

DROP TABLE reviews;
ALTER TABLE reviews_new RENAME TO reviews;

CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_type, service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_ip_hash ON reviews(ip_hash, created_at);
