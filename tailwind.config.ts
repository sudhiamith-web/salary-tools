import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#FAFAFA",
        paperDark: "#F3F4F6",
        ledger: "#0E9F6E",
        rust: "#DC2626",
        gold: "#C27803",
        charcoal: "#374151",
        accent: "#6D28D9",
        accentDark: "#4C1D95",
        accentLight: "#A78BFA",
        accentTint: "#EDE9FE",
        insight: "#4C1D95",
        insightTint: "#F5F3FF",
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
