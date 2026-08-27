import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16283A",
        paper: "#EEF0E9",
        paperDark: "#E2E5DB",
        ledger: "#1F6F54",
        rust: "#B5482A",
        gold: "#B8923F",
        charcoal: "#1C2321",
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
