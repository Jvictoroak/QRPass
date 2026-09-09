import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const colors = {
  black: "#0B0B0F",
  surface: "#141417",
  surfaceElevated: "#1C1C20",
  white: "#FFFFFF",

  purple: "#5E17EB",
  purpleMuted: "rgba(94, 23, 235, 0.2)",
  purpleText: "#B98CFF",

  neon: "#C6FF3D",
  neonMuted: "rgba(198, 255, 61, 0.15)",
  neonText: "#C6FF3D",

  gray: "#9C9CA3",
  grayMuted: "#5C5C63",
  border: "#2A2A30",

  danger: "#E24B4A",
  dangerMuted: "rgba(226, 75, 74, 0.15)",
} as const;

export const fonts = {
  regular: "Rubik_400Regular",
  medium: "Rubik_500Medium",
  bold: "Rubik_700Bold",
  black: "Rubik_900Black",
} as const;

export const typography = {
  h1: {
    fontFamily: fonts.black,
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.white,
  },
  h3: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
  },
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.gray,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const theme = { colors, fonts, typography, spacing, radius };

export default theme;
