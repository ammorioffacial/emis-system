import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ["var(--font-tajawal)", "Tajawal", "sans-serif"],
      },
      colors: {
        // Light-green form header/label color, matched to the reference form
        "form-green": {
          DEFAULT: "#d9ead3",
          light: "#e9f4e5",
          border: "#93c47d",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
      },
    },
  },
  plugins: [],
};

export default config;
