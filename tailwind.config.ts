import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        paper: "#F7F9FC",
        paperDark: "#EDF1F7",
        ledger: "#0E9F6E",
        rust: "#E02424",
        gold: "#C27803",
        charcoal: "#334155",
        accent: "#2E5EFF",
        accentTint: "#EAF0FF",
        insight: "#7C3AED",
        insightTint: "#F3EEFF",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
