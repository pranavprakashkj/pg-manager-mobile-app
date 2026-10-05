/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // Indigo 600
        success: "#22c55e", // Green 500
        warning: "#f59e0b", // Amber 500
        danger: "#ef4444", // Red 500
        inactive: "#9ca3af", // Gray 400
        reserved: "#a855f7", // Purple 500
        maintenance: "#525252", // Neutral 600
        background: "#f8fafc", // Slate 50
        card: "#ffffff",
      }
    },
  },
  plugins: [],
}
