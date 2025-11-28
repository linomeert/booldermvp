/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      keyframes: {
        buzz: {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "translateX(-4px) rotate(-1deg)",
          },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px) rotate(1deg)" },
        },
      },
      animation: {
        buzz: "buzz 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
      },
    },
  },
  plugins: [],
};
