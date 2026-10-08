import React from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { Icon, IconName } from "./Icon";
import { ThemeColors, useThemeColors } from "../../theme/tokens";

export type MetricDot = "info" | "success" | "warning" | "neutral";

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  dot?: MetricDot;
  icon?: IconName;
  tone?: "danger" | "warning" | "success";
}

const dotColor: Record<MetricDot, (c: ThemeColors) => string> = {
  info: (c) => c.accent,
  success: (c) => c.success,
  warning: (c) => c.warning,
  neutral: (c) => c.inkSubtle,
};

/** KPI well inside a card (sunken surface, 10px radius). */
export function MetricTile({ label, value, sub, dot, icon, tone }: MetricTileProps) {
  const colors = useThemeColors();
  const bg =
    tone === "danger" ? "bg-danger-soft" : tone === "warning" ? "bg-warning-soft" : tone === "success" ? "bg-success-soft" : "bg-surface-sunken";
  const toned = tone === "danger" ? "danger-ink" : tone === "warning" ? "warning-ink" : tone === "success" ? "success-ink" : null;
  const iconColor =
    tone === "danger" ? colors.dangerInk : tone === "warning" ? colors.warningInk : tone === "success" ? colors.successInk : colors.inkMuted;

  return (
    <View className={`min-w-0 flex-1 gap-0.5 rounded-md p-3 ${bg}`}>
      <View className="flex-row items-center gap-1.5">
        {dot ? <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor[dot](colors) }} /> : null}
        {icon ? <Icon name={icon} size={14} color={iconColor} /> : null}
        <Text variant="label" tone={toned ?? "muted"} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text variant="stat" tone={toned ?? "ink"} numberOfLines={1}>
        {value}
      </Text>
      {sub ? (
        <Text variant="micro" tone={toned ?? "subtle"} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/** Row of metric tiles; wraps to two per row on narrow screens. */
export function MetricTiles({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  if (items.length <= 3) {
    return <View className="flex-row gap-2">{items}</View>;
  }
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View className="gap-2">
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-2">
          {row}
        </View>
      ))}
    </View>
  );
}
