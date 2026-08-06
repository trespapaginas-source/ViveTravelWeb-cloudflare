-- Sistema de reseñas de Vive Travel.
-- Tabla única para planes y cabañas (service_type distingue).
-- Aplicar con: npx wrangler d1 execute vive-travel-reviews --remote --file=migrations/0001_reviews.sql

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type TEXT NOT NULL CHECK(service_type IN ('plan', 'cabin')),
  service_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT
);

-- Índice para listar reseñas de un servicio rápidamente.
CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_type, service_id);

-- Índice para el rate-limit suave por IP (evitar spam del mismo origen).
CREATE INDEX IF NOT EXISTS idx_reviews_ip_hash ON reviews(ip_hash, created_at);
