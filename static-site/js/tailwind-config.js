// Configures the Tailwind Play CDN build. Must load AFTER the CDN
// <script src="https://cdn.tailwindcss.com"></script> tag and BEFORE
// any elements that use these custom classes are rendered/scanned.
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
      },
      colors: {
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
};
