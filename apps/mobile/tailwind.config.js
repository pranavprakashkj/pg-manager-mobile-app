/** @type {import('tailwindcss').Config} */

// V2 tokens are CSS variables (see global.css) so light/dark follow the system theme.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: v("primary"),
          hover: v("primary-hover"),
          text: v("primary-text"),
          soft: v("primary-soft"),
          "soft-ink": v("primary-soft-ink"),
        },
        "on-primary": v("on-primary"),
        accent: v("accent"),
        ink: {
          DEFAULT: v("ink"),
          muted: v("ink-muted"),
          subtle: v("ink-subtle"),
        },
        surface: {
          page: v("surface-page"),
          card: v("surface-card"),
          sunken: v("surface-sunken"),
        },
        border: {
          DEFAULT: v("border"),
          control: v("border-control"),
        },
        track: v("track"),
        focus: v("focus-ring"),
        success: {
          DEFAULT: v("success"),
          soft: v("success-soft"),
          ink: v("success-ink"),
        },
        warning: {
          DEFAULT: v("warning"),
          soft: v("warning-soft"),
          ink: v("warning-ink"),
        },
        danger: {
          DEFAULT: v("danger"),
          soft: v("danger-soft"),
          ink: v("danger-ink"),
          solid: v("danger-solid"),
        },
        neutral: {
          soft: v("neutral-soft"),
        },
        avatar: {
          1: v("avatar-1"),
          2: v("avatar-2"),
          3: v("avatar-3"),
          4: v("avatar-4"),
        },
        // V1 aliases, kept so untouched screens still resolve to V2 tokens.
        background: v("surface-page"),
        card: v("surface-card"),
        inactive: v("ink-subtle"),
      },
      fontFamily: {
        jakarta: ["PlusJakartaSans_500Medium"],
        "jakarta-semibold": ["PlusJakartaSans_600SemiBold"],
        "jakarta-bold": ["PlusJakartaSans_700Bold"],
        "jakarta-extrabold": ["PlusJakartaSans_800ExtraBold"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
