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
        obsidian: "#0B0D10",
        parchment: "#F1E8D2",
        brass: "#C69C5D",
        crimson: "#7D1F2A",
        teal: { DEFAULT: "#0E4C4F" },
        ash: "#171B20",
        "evidence-blue": "#6B8FB3",
        success: "#648F70",
        warning: "#C58B3B",
        danger: "#A94343",
        fog: "rgba(241,232,210,0.16)",
        "muted-parchment": "rgba(241,232,210,0.68)",
      },
    },
  },
  plugins: [],
};

export default config;
