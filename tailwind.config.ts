import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pink: "#FF7BD5",
        pinkSoft: "#FFE3F4",
        pinkDeep: "#993556",
        cream: "#FAF8F5",
        ink: "#111111",
        tangerine: "#FF8A3D",
        sky: "#7FB8FF",
        lime: "#B6F09C",
        lavender: "#C9A8FF",
        success: "#639922",
        warning: "#EF9F27",
        danger: "#E24B4A",
        muted: "#888888",
        border: "#EBEBEB"
      },
      fontFamily: {
        display: ["var(--font-inter-tight)", "Helvetica Neue", "Arial", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 8px 32px rgba(17,17,17,0.07)",
        card: "0 2px 12px rgba(17,17,17,0.06)",
        pill: "0 4px 20px rgba(17,17,17,0.18)"
      },
      borderRadius: {
        pill: "9999px",
        card: "24px",
        "card-lg": "32px"
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
        tight: "-0.02em"
      }
    }
  },
  plugins: []
};

export default config;
