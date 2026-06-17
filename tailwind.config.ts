import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pookie: {
          bg: "#FFF7FB",
          card: "#FFFFFF",
          pink: "#FF8ACD",
          purple: "#B692FF",
          mint: "#8EF0C2",
          yellow: "#FFD36E",
          text: "#2D2433",
          muted: "#8C7C95",
          danger: "#FF6B8A",
          success: "#58CC8B",
          ink: "#251E2B"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(121, 68, 116, 0.16)",
        button: "0 10px 0 rgba(150, 84, 136, 0.18)"
      },
      borderRadius: {
        pookie: "30px"
      },
      fontFamily: {
        rounded: ["var(--font-nunito)", "ui-rounded", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
