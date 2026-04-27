import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#eee3c9",
        ink: "#35291f",
        muted: "#7a6856",
        stamp: "#894638",
        olive: "#66624d",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["Courier New", "Courier", "monospace"],
      },
      boxShadow: {
        dossier: "0 10px 30px rgba(53, 41, 31, 0.12)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(53, 41, 31, 0.05) 0, transparent 22%), radial-gradient(circle at 80% 0%, rgba(137, 70, 56, 0.08) 0, transparent 18%), radial-gradient(circle at 50% 80%, rgba(102, 98, 77, 0.06) 0, transparent 22%)",
      },
    },
  },
  plugins: [],
};

export default config;
