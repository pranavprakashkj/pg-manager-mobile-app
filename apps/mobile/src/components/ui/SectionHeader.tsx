import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Text";
import { Badge, BadgeTone } from "./Badge";
import { Icon } from "./Icon";
import { useThemeColors } from "../../theme/tokens";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  countTone?: BadgeTone;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, count, countTone = "neutral", action, onAction }: SectionHeaderProps) {
  const colors = useThemeColors();
  return (
    <View className="min-h-[32px] flex-row items-center justify-between gap-2">
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          {count != null ? <Badge label={count > 99 ? "99+" : String(count)} tone={countTone} /> : null}
        </View>
        {subtitle ? (
          <Text variant="caption" tone="subtle">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          className="min-h-[44px] flex-row items-center gap-0.5"
        >
          <Text variant="label" tone="primary" style={{ fontSize: 13 }}>
            {action}
          </Text>
          <Icon name="chevron-right" size={14} color={colors.primaryText} />
        </Pressable>
      ) : null}
    </View>
  );
}
