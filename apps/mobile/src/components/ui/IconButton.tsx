import React from "react";
import { Pressable, PressableProps, View } from "react-native";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";
import { useThemeColors } from "../../theme/tokens";

interface IconButtonProps extends Omit<PressableProps, "children"> {
  icon: IconName;
  /** Accessible name; icon-only buttons must always describe their action. */
  label: string;
  variant?: "plain" | "outline" | "soft" | "primary";
  badge?: number;
  className?: string;
}

/** 44×44 icon-only control (design token `tap-min`). */
export function IconButton({ icon, label, variant = "plain", badge, disabled, className = "", ...props }: IconButtonProps) {
  const colors = useThemeColors();
  const color =
    variant === "primary"
      ? colors.onPrimary
      : variant === "soft"
        ? colors.primarySoftInk
        : variant === "outline"
          ? colors.primaryText
          : colors.inkMuted;

  const variantClass = {
    plain: "bg-transparent active:bg-surface-sunken",
    outline: "bg-surface-card border border-border active:bg-surface-sunken",
    soft: "bg-primary-soft active:bg-surface-sunken",
    primary: "bg-primary rounded-full active:bg-primary-hover",
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={`h-11 w-11 items-center justify-center rounded-md ${variantClass} ${disabled ? "opacity-[0.45]" : ""} ${className}`}
      {...props}
    >
      <Icon name={icon} size={20} color={color} />
      {badge ? (
        <View className="absolute right-1.5 top-1.5 h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-surface-card bg-danger-solid px-1">
          <Text variant="micro" tone="on-primary" style={{ fontSize: 9, lineHeight: 11 }}>
            {badge > 99 ? "99+" : String(badge)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
