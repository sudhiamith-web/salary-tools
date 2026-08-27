import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16283A",       // deep navy — headers, primary text on paper
        paper: "#EEF0E9",     // cool paper grey — page background
        paperDark: "#E2E5DB", // slightly deeper paper for cards
        ledger: "#1F6F54",    // ledger green — earnings, positive figures
        rust: "#B5482A",      // rust red — deductions, used sparingly
        gold: "#B8923F",      // gold — highlights, premium accents
        charcoal: "#1C2321",  // body text
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
