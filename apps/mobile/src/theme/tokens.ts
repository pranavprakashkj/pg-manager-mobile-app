import { useColorScheme } from "react-native";

/**
 * PG Manager V2 color tokens for JS consumers (icons, ActivityIndicator,
 * navigator options, placeholder colors). Class-based styling uses the
 * matching CSS variables in global.css — keep both in sync.
 */
export const palette = {
  light: {
    primary: "#1D4ED8",
    primaryHover: "#1E40AF",
    primaryText: "#1D4ED8",
    primarySoft: "#EFF6FF",
    primarySoftInk: "#1E40AF",
    onPrimary: "#FFFFFF",
    accent: "#2563EB",
    ink: "#0F172A",
    inkMuted: "#475569",
    inkSubtle: "#5B6B80",
    surfacePage: "#F4F6FB",
    surfaceCard: "#FFFFFF",
    surfaceSunken: "#F1F5F9",
    border: "#E2E8F0",
    borderControl: "#7A879C",
    track: "#E2E8F0",
    focusRing: "#2563EB",
    success: "#15803D",
    successSoft: "#ECFDF3",
    successInk: "#166534",
    warning: "#B45309",
    warningSoft: "#FFF7E6",
    warningInk: "#92400E",
    danger: "#B91C1C",
    dangerSoft: "#FEF2F2",
    dangerInk: "#991B1B",
    dangerSolid: "#DC2626",
    neutralSoft: "#F1F5F9",
    scrim: "rgba(15, 23, 42, 0.48)",
  },
  dark: {
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    primaryText: "#93C5FD",
    primarySoft: "#16244A",
    primarySoftInk: "#BFDBFE",
    onPrimary: "#FFFFFF",
    accent: "#60A5FA",
    ink: "#F1F5F9",
    inkMuted: "#A5B1C4",
    inkSubtle: "#8A98AD",
    surfacePage: "#0B1120",
    surfaceCard: "#131C2E",
    surfaceSunken: "#1B2539",
    border: "#26324A",
    borderControl: "#64748B",
    track: "#26324A",
    focusRing: "#93C5FD",
    success: "#4ADE80",
    successSoft: "#0F2A1C",
    successInk: "#86EFAC",
    warning: "#FBBF24",
    warningSoft: "#2E220B",
    warningInk: "#FCD34D",
    danger: "#F87171",
    dangerSoft: "#341416",
    dangerInk: "#FCA5A5",
    dangerSolid: "#DC2626",
    neutralSoft: "#222D42",
    scrim: "rgba(2, 6, 15, 0.72)",
  },
} as const;

export type ThemeColors = { [K in keyof (typeof palette)["light"]]: string };

export const fonts = {
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

/** Minimum touch target for every control (design token `tap-min`). */
export const TAP_MIN = 44;

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? palette.dark : palette.light;
}

export function useIsDark(): boolean {
  return useColorScheme() === "dark";
}
