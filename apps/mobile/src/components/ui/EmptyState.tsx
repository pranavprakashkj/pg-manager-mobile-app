import React from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { Icon, IconName } from "./Icon";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useThemeColors } from "../../theme/tokens";

export type EmptyTone = "info" | "search" | "success" | "danger" | "offline";

interface EmptyStateProps {
  title: string;
  message?: string;
  tone?: EmptyTone;
  icon?: IconName;
  eyebrow?: string;
  action?: string;
  actionIcon?: IconName;
  onAction?: () => void;
  secondaryAction?: string;
  secondaryIcon?: IconName;
  onSecondary?: () => void;
}

const defaultIcon: Record<EmptyTone, IconName> = {
  info: "building",
  search: "search",
  success: "check-circle",
  danger: "alert",
  offline: "wifi-off",
};

/** Centered illustration-free empty / error state (64px icon disc, title, copy, up to two actions). */
export function EmptyState({
  title,
  message,
  tone = "info",
  icon,
  eyebrow,
  action,
  actionIcon,
  onAction,
  secondaryAction,
  secondaryIcon,
  onSecondary,
}: EmptyStateProps) {
  const colors = useThemeColors();
  const disc = {
    info: { bg: "bg-primary-soft", color: colors.primarySoftInk },
    search: { bg: "bg-primary-soft", color: colors.primarySoftInk },
    success: { bg: "bg-success-soft", color: colors.successInk },
    danger: { bg: "bg-danger-soft", color: colors.dangerInk },
    offline: { bg: "bg-warning-soft", color: colors.warningInk },
  }[tone];

  return (
    <View className="items-center gap-3 px-6 py-8">
      <View className={`h-16 w-16 items-center justify-center rounded-full ${disc.bg}`}>
        <Icon name={icon ?? defaultIcon[tone]} size={28} color={disc.color} />
      </View>
      {eyebrow ? (
        <Badge label={eyebrow} tone={tone === "success" ? "success" : tone === "danger" ? "danger" : "info"} />
      ) : null}
      <Text variant="title-md" className="text-center" accessibilityRole="header">
        {title}
      </Text>
      {message ? (
        <Text variant="body" tone="muted" className="max-w-[300px] text-center">
          {message}
        </Text>
      ) : null}
      {action || secondaryAction ? (
        <View className="mt-2 w-full max-w-[320px] gap-2">
          {action ? (
            <Button
              label={action}
              icon={actionIcon}
              variant={tone === "search" ? "secondary" : "primary"}
              block
              onPress={onAction}
            />
          ) : null}
          {secondaryAction ? (
            <Button label={secondaryAction} icon={secondaryIcon} variant="outline" block onPress={onSecondary} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
