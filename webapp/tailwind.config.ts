import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0D0B11",
          card: "#1E1928",
          elevated: "#2A2338",
          input: "#15121B",
        },
        orange: {
          DEFAULT: "#F56228",
          light: "#FF7A45",
          dim: "rgba(245,98,40,0.15)",
        },
        border: {
          subtle: "rgba(255,255,255,0.06)",
          orange: "rgba(245,98,40,0.3)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "orange-glow":
          "radial-gradient(ellipse at top, rgba(245,98,40,0.15) 0%, transparent 70%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-orange": "pulseOrange 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseOrange: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,98,40,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(245,98,40,0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
