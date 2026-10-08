import React from "react";
import { ActivityIndicator, Pressable, PressableProps, View } from "react-native";
import { Text } from "./Text";
import { Icon, IconName } from "./Icon";
import { ThemeColors, useThemeColors } from "../../theme/tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "danger-ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  block?: boolean;
  loading?: boolean;
  className?: string;
}

const containerClass: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primary-hover",
  secondary: "bg-primary-soft active:bg-surface-sunken",
  outline: "bg-surface-card border border-border-control active:bg-surface-sunken",
  ghost: "bg-transparent active:bg-surface-sunken",
  danger: "bg-danger-solid active:opacity-90",
  "danger-ghost": "bg-transparent active:bg-danger-soft",
};

function contentColor(variant: ButtonVariant, c: ThemeColors): string {
  switch (variant) {
    case "primary":
    case "danger":
      return c.onPrimary;
    case "secondary":
      return c.primarySoftInk;
    case "danger-ghost":
      return c.danger;
    default:
      return c.primaryText;
  }
}

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-[36px] px-3",
  md: "min-h-[44px] px-4",
  lg: "min-h-[52px] px-4",
};

/** V2 button: 10px radius, 44px default height (52px lg, 36px sm for in-card actions). */
export function Button({
  label,
  variant = "primary",
  size = "md",
  icon,
  block,
  loading,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const color = contentColor(variant, colors);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      hitSlop={size === "sm" ? 4 : undefined}
      className={`flex-row items-center justify-center rounded-md ${sizeClass[size]} ${containerClass[variant]} ${
        block ? "w-full" : ""
      } ${disabled && !loading ? "opacity-[0.45]" : ""} ${className}`}
      {...props}
    >
      <View className={`flex-row items-center justify-center gap-2 ${loading ? "opacity-0" : ""}`}>
        {icon ? <Icon name={icon} size={18} color={color} /> : null}
        <Text
          variant="button"
          tone="inherit"
          style={{ color, fontSize: size === "sm" ? 13 : size === "lg" ? 15 : 14 }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" color={color} />
        </View>
      ) : null}
    </Pressable>
  );
}
