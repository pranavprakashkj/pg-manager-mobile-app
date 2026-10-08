import React from "react";
import { View } from "react-native";
import { Text, TextTone } from "./Text";
import { Icon, IconName } from "./Icon";
import { useThemeColors } from "../../theme/tokens";

type BannerTone = "info" | "success" | "warning" | "danger";

interface BannerProps {
  tone?: BannerTone;
  title?: string;
  message?: string;
  icon?: IconName;
}

export function Banner({ tone = "info", title, message, icon }: BannerProps) {
  const colors = useThemeColors();
  const s: Record<BannerTone, { bg: string; text: TextTone; color: string; icon: IconName }> = {
    info: { bg: "bg-primary-soft", text: "primary-soft-ink", color: colors.primarySoftInk, icon: "info" },
    success: { bg: "bg-success-soft", text: "success-ink", color: colors.successInk, icon: "check-circle" },
    warning: { bg: "bg-warning-soft", text: "warning-ink", color: colors.warningInk, icon: "clock" },
    danger: { bg: "bg-danger-soft", text: "danger-ink", color: colors.dangerInk, icon: "alert-circle" },
  };
  const t = s[tone];
  return (
    <View
      accessibilityRole={tone === "danger" ? "alert" : "summary"}
      className={`flex-row items-start gap-3 rounded-lg px-4 py-3 ${t.bg}`}
    >
      <Icon name={icon ?? t.icon} size={20} color={t.color} />
      <View className="flex-1">
        {title ? (
          <Text variant="body-strong" tone={t.text}>
            {title}
          </Text>
        ) : null}
        {message ? (
          <Text variant="body-sm" tone={t.text}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
