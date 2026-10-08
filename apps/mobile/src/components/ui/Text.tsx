import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";
import { fonts } from "../../theme/tokens";

/** Type scale from the V2 design system (ds/pgm tokens.json → type). */
const variants = StyleSheet.create({
  "amount-xl": { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.56, fontVariant: ["tabular-nums"] },
  "title-lg": { fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 28, letterSpacing: -0.22 },
  stat: { fontFamily: fonts.extrabold, fontSize: 20, lineHeight: 26, fontVariant: ["tabular-nums"] },
  "title-md": { fontFamily: fonts.extrabold, fontSize: 18, lineHeight: 24 },
  title: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 24 },
  "card-title": { fontFamily: fonts.extrabold, fontSize: 16, lineHeight: 22 },
  headline: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  "body-strong": { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
  "body-sm": { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.66, textTransform: "uppercase" },
  tab: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14 },
  micro: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
});

export type TextVariant = keyof typeof variants;

export type TextTone =
  | "ink"
  | "muted"
  | "subtle"
  | "primary"
  | "primary-soft-ink"
  | "on-primary"
  | "success"
  | "success-ink"
  | "warning"
  | "warning-ink"
  | "danger"
  | "danger-ink"
  | "inherit";

const toneClass: Record<TextTone, string> = {
  ink: "text-ink",
  muted: "text-ink-muted",
  subtle: "text-ink-subtle",
  primary: "text-primary-text",
  "primary-soft-ink": "text-primary-soft-ink",
  "on-primary": "text-on-primary",
  success: "text-success",
  "success-ink": "text-success-ink",
  warning: "text-warning",
  "warning-ink": "text-warning-ink",
  danger: "text-danger",
  "danger-ink": "text-danger-ink",
  inherit: "",
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
}

export function Text({ variant = "body", tone = "ink", className = "", style, ...props }: TextProps) {
  return (
    <RNText
      className={`${toneClass[tone]} ${className}`}
      style={[variants[variant], style]}
      maxFontSizeMultiplier={1.4}
      {...props}
    />
  );
}
