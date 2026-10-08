import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Text";
import { Icon, IconName } from "./Icon";
import { useThemeColors } from "../../theme/tokens";

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  tone?: "default" | "danger";
  meta?: string;
  /** `null` hides the trailing chevron. */
  trailing?: React.ReactNode | null;
  onPress?: () => void;
  disabled?: boolean;
  /** Draws the hairline divider above this row (all rows except the first in a list). */
  divider?: boolean;
}

/** 56px tappable row used inside flush cards. */
export function ListRow({ title, subtitle, icon, tone = "default", meta, trailing, onPress, disabled, divider }: ListRowProps) {
  const colors = useThemeColors();
  const danger = tone === "danger";
  const trail =
    trailing === undefined ? <Icon name="chevron-right" size={18} color={colors.inkSubtle} /> : trailing;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`min-h-[56px] flex-row items-center gap-3 px-4 py-3 active:bg-surface-sunken ${
        divider ? "border-t border-border" : ""
      }`}
    >
      {icon ? (
        <View
          className={`h-9 w-9 items-center justify-center rounded-md ${danger ? "bg-danger-soft" : "bg-surface-sunken"}`}
        >
          <Icon name={icon} size={18} color={danger ? colors.dangerInk : colors.inkMuted} />
        </View>
      ) : null}
      <View className={`min-w-0 flex-1 ${disabled ? "opacity-60" : ""}`}>
        <Text variant="body-strong" tone={danger ? "danger" : "ink"} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="subtle" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-2">
        {meta ? (
          <Text variant="caption" tone="subtle">
            {meta}
          </Text>
        ) : null}
        {trail}
      </View>
    </Pressable>
  );
}
