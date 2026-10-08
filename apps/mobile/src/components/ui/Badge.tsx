import React from "react";
import { View } from "react-native";
import { Text, TextTone } from "./Text";
import { Icon, IconName } from "./Icon";
import { ThemeColors, useThemeColors } from "../../theme/tokens";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "solid";

const toneStyles: Record<BadgeTone, { bg: string; text: TextTone; color: (c: ThemeColors) => string }> = {
  neutral: { bg: "bg-neutral-soft", text: "muted", color: (c) => c.inkMuted },
  info: { bg: "bg-primary-soft", text: "primary-soft-ink", color: (c) => c.primarySoftInk },
  success: { bg: "bg-success-soft", text: "success-ink", color: (c) => c.successInk },
  warning: { bg: "bg-warning-soft", text: "warning-ink", color: (c) => c.warningInk },
  danger: { bg: "bg-danger-soft", text: "danger-ink", color: (c) => c.dangerInk },
  solid: { bg: "bg-primary", text: "on-primary", color: (c) => c.onPrimary },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  dot?: boolean;
  square?: boolean;
}

/** Status pill. Color is never the only signal — always paired with a word. */
export function Badge({ label, tone = "neutral", icon, dot, square }: BadgeProps) {
  const colors = useThemeColors();
  const s = toneStyles[tone];
  const color = s.color(colors);
  return (
    <View
      className={`h-[22px] flex-row items-center gap-1 self-start px-2 ${square ? "rounded-sm" : "rounded-full"} ${s.bg}`}
    >
      {icon ? (
        <Icon name={icon} size={12} color={color} strokeWidth={2.25} />
      ) : dot ? (
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      <Text variant="tab" tone={s.text} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
