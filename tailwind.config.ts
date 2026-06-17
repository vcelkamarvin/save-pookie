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
          bg: "#FAFAF7",
          card: "#FFFFFF",
          pink: "#F7A8C8",
          purple: "#A88CFF",
          mint: "#BFE7FF",
          yellow: "#F6C85F",
          text: "#1F1F1F",
          muted: "#8A8A8A",
          danger: "#FF6F91",
          success: "#63D68A",
          ink: "#1F1F1F",
          border: "#EDEDE8"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(31, 31, 31, 0.08)",
        button: "0 10px 24px rgba(31, 31, 31, 0.10)"
      },
      borderRadius: {
        pookie: "30px"
      },
      fontFamily: {
        rounded: ["var(--font-inter)", "Helvetica Neue", "Arial", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
