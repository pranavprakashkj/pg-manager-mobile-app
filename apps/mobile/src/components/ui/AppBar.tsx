import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Text } from "./Text";
import { IconButton } from "./IconButton";
import { fonts } from "../../theme/tokens";

interface AppBarProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Large titles are used on the five tab roots. */
  large?: boolean;
  /** Shows a back button. Pass `true` for router.back(), or a custom handler. */
  back?: boolean | (() => void);
  actions?: React.ReactNode;
}

/** Top app bar on the card surface; owns the status-bar safe area. */
export function AppBar({ title, subtitle, eyebrow, large, back, actions }: AppBarProps) {
  const insets = useSafeAreaInsets();
  const onBack = typeof back === "function" ? back : back ? () => router.back() : undefined;

  return (
    <View className="border-b border-border bg-surface-card" style={{ paddingTop: insets.top }}>
      <View className={`min-h-[56px] flex-row items-center gap-2 py-2 pr-2 ${onBack ? "pl-1" : "pl-4"}`}>
        {onBack ? <IconButton icon="arrow-left" label="Back" onPress={onBack} /> : null}
        <View className="min-w-0 flex-1">
          {eyebrow ? (
            <Text variant="overline" tone="subtle">
              {eyebrow}
            </Text>
          ) : null}
          <Text
            variant={large ? "title-lg" : "title"}
            accessibilityRole="header"
            numberOfLines={1}
            style={large ? undefined : { fontFamily: fonts.extrabold, lineHeight: 22 }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="subtle" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {actions ? <View className="flex-row items-center gap-0.5">{actions}</View> : null}
      </View>
    </View>
  );
}
