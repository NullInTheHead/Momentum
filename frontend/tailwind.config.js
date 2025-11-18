/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#00C2FF",
          purple: "#6A4BFF",
        },
        surface: "#0B0B21",
        card: "#0F1028",
        accent: "#0CE6FF",
      },
    },
  },
  plugins: [],
};

