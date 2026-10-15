import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Manifesto Markets — editorial news meets terminal-grade data
        bg: "#F8F6F1",          // warm cream paper
        surface: "#FFFFFF",      // card surface
        ink: "#0E0E0C",          // primary text
        "ink-soft": "#4B4B47",   // secondary text
        "ink-faint": "#8B8B85",  // tertiary text / meta
        line: "#E7E2D6",         // warm border
        "line-soft": "#F0EBE0",  // subtle divider
        up: "#0F7A37",           // gain
        down: "#B91C1C",         // loss
        accent: "#1B2A4E",       // deep navy
        gold: "#A67C2E",         // editorial accent / premium
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};
export default config;