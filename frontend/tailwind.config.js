/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0a0e1a",
          surface: "#0f1629",
          card: "#111827",
          border: "#1e2d4a",
          accent: "#00d4ff",
          "accent-dim": "#0ea5e9",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          muted: "#4b5563",
          text: "#e2e8f0",
          "text-dim": "#94a3b8",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scan: "scan 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        scan: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};