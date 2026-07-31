/** @type {import('tailwindcss').Config} */
// Tokens de marca extraídos del proyecto de referencia (D:/Proyectos/ViveTravel).
// Primary: Dark Teal #008B8B (alias "ocean").
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand — alias "ocean" usado en todo el código del original.
        ocean: {
          DEFAULT: "#008B8B",
          light: "#03A6A6",
          dark: "#005C5C",
        },
        // Neutrales heredados del original (mint/sky/sand/leaf → gris).
        mint: { DEFAULT: "#9CA3AF", light: "#D1D5DB" },
        sky: { DEFAULT: "#9CA3AF", light: "#D1D5DB" },
        sand: { DEFAULT: "#9CA3AF", light: "#D1D5DB" },
        leaf: { DEFAULT: "#6B7280", light: "#E5E7EB" },
        palm: { DEFAULT: "#6B7280", light: "#E5E7EB" },
        sunset: { DEFAULT: "#F27405", light: "#F2A365" },
        // Acentos de marca
        indigo: { DEFAULT: "#008B8B", light: "#E0F4F4" },
        coral: "#008B8B",
        // Tokens semánticos (shadcn-style, vía variables CSS en index.css)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.15)" },
          "50%": { transform: "scale(1)" },
          "75%": { transform: "scale(1.1)" },
        },
      },
      animation: {
        heartbeat: "heartbeat 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
