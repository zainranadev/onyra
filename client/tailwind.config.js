/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: { DEFAULT: "#6B4226", 50: "#F5EDE6" },
        orange: { DEFAULT: "#F97316" },
        purple: { DEFAULT: "#7C3AED" },
        ink: "#18181B",
        graphite: "#52525B",
        mist: "#F4F4F5",
        cream: "#FFF7ED",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Fraunces'", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(24,24,27,0.04), 0 8px 24px -12px rgba(24,24,27,0.12)",
        lift: "0 20px 40px -16px rgba(107,66,38,0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        fadeUp: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite linear",
        fadeUp: "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
