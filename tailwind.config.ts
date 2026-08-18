import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial "Esthétique" palette
        background: "#fbf9f8",
        primary: "#000000",
        secondary: "#6e5c37",
        "secondary-fixed": "#f9dfb1",
        "secondary-container": "#f6ddae",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#444748",
        outline: "#747878",
        "outline-variant": "#c4c7c7",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f3",
        "surface-container": "#efeded",
        "surface-container-high": "#e9e8e7",
        "surface-variant": "#e4e2e2",
        // Kept for backward compatibility across existing pages
        brand: {
          50: "#f5f3f0",
          100: "#e9e4dc",
          200: "#d7cebf",
          300: "#bcac93",
          400: "#9e8a67",
          500: "#82704b",
          600: "#6e5c37",
          700: "#584a2d",
          800: "#473c26",
          900: "#3a3121",
          950: "#221c12",
        },
        surface: {
          DEFAULT: "#fbf9f8",
          card: "#ffffff",
          muted: "#f3f1ee",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      letterSpacing: {
        caps: "0.1em",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
        ambient: "0 12px 32px rgba(26, 26, 26, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
