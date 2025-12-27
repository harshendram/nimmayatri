import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "auto-yellow": "#FFD700",
        "auto-yellow-dark": "#E6C200",
        asphalt: "#1a1a2e",
        "asphalt-light": "#2a2a3e",
        "signal-green": "#00FF88",
        "signal-red": "#FF4444",
        "bengaluru-purple": "#8B5CF6",
      },
      fontFamily: {
        luxury: ["Playfair Display", "serif"],
        modern: ["Poppins", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 215, 0, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      borderWidth: {
        "3": "3px",
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body': 'var(--tw-prose-invert-body)',
            '--tw-prose-headings': 'var(--tw-prose-invert-headings)',
            '--tw-prose-links': 'var(--tw-prose-invert-links)',
            '--tw-prose-bold': 'var(--tw-prose-invert-bold)',
            '--tw-prose-quotes': 'var(--tw-prose-invert-quotes)',
            '--tw-prose-code': 'var(--tw-prose-invert-code)',
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
