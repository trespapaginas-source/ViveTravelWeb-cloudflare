/** @type {import('tailwindcss').Config} */
// Tokens de marca extraídos del proyecto de referencia (D:/Proyectos/ViveTravel).
// Primary: Dark Teal #008B8B (alias "ocean").
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand accent "ocean" — USO RESTRINGIDO: solo botón circular del
        // Hero (5% de acento permitido). Todo el resto de la UI es neutral.
        ocean: {
          DEFAULT: "#008B8B",
          light: "#03A6A6",
          dark: "#005C5C",
        },
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
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        heartbeat: "heartbeat 1.2s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
