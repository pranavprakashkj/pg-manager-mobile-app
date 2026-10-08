import React from "react";
import { View } from "react-native";
import { Text } from "./Text";

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  tone?: "accent" | "success" | "warning" | "danger";
  startLabel?: string;
  endLabel?: string;
}

const fillClass = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({ value, max = 100, label, tone = "accent", startLabel, endLabel }: ProgressBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <View className="gap-1.5">
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max, now: value }}
        className="h-2 overflow-hidden rounded-full bg-track"
      >
        <View className={`h-full rounded-full ${fillClass[tone]}`} style={{ width: `${pct}%` }} />
      </View>
      {startLabel || endLabel ? (
        <View className="flex-row justify-between gap-2">
          <Text variant="caption" tone="subtle" className="shrink">
            {startLabel}
          </Text>
          <Text variant="caption" tone="subtle" className="shrink text-right">
            {endLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
