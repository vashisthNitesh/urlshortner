import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#EFF6FF"
        },
        secondary: {
          DEFAULT: "#0EA5E9",
          foreground: "#ECFEFF"
        },
        muted: "#6B7280",
        background: "#0B1221"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
