import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Las Cloudflare Pages Functions (/functions/api/*) no las sirve Vite.
      // En local, levanta aparte `npx wrangler pages dev dist --port 8788`
      // (o el proxy equivalente) y Vite reenvía /api hacia ahí.
      "/api": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
    },
  },
});
