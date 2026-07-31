/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta base alineada con la marca Vive Travel (refinada en FASE 1).
        ocean: {
          DEFAULT: "#1a73e8",
          dark: "#0b5394",
        },
        background: "#ffffff",
        foreground: "#0f172a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
