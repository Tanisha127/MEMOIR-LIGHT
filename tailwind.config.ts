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
        // Memoir Light Palette - warm sage & terracotta
        cream: {
          50: "#FFFDF9",
          100: "#FFF8EE",
          200: "#FDF0DC",
          300: "#F9E5C8",
          DEFAULT: "#FDF0DC",
        },
        sage: {
          50: "#EEF3F1",
          100: "#D5E4DF",
          200: "#A8C8BF",
          300: "#7CAF9E",
          400: "#5A9486",
          500: "#3D7A6C",
          DEFAULT: "#7CAF9E",
        },
        terracotta: {
          50: "#FDF1EE",
          100: "#F9DDD6",
          200: "#F0B8A8",
          300: "#E59078",
          400: "#D4704E",
          500: "#B85A38",
          DEFAULT: "#D4704E",
        },
        amber: {
          warm: "#E8B86D",
          light: "#F5D49A",
          deep: "#C4923A",
        },
        stone: {
          warm: "#8C7B6B",
          light: "#C4B5A5",
          lighter: "#E8DDD4",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Lora'", "Georgia", "serif"],
        ui: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        warm: "0 4px 24px rgba(180, 120, 80, 0.12)",
        "warm-lg": "0 8px 40px rgba(180, 120, 80, 0.18)",
        soft: "0 2px 16px rgba(0, 0, 0, 0.06)",
        "soft-lg": "0 8px 32px rgba(0, 0, 0, 0.10)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "breathe": "breathe 4s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "pulse-warm": "pulseWarm 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseWarm: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212, 112, 78, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(212, 112, 78, 0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
