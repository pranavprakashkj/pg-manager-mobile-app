import React from "react";
import { View } from "react-native";
import { Card } from "./Card";
import { Text } from "./Text";
import { Icon, IconName } from "./Icon";
import { ProgressBar } from "./ProgressBar";
import { useThemeColors } from "../../theme/tokens";

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  icon?: IconName;
  progress?: number;
  progressStart?: string;
  progressEnd?: string;
  children?: React.ReactNode;
}

/** Hero KPI card: overline, big figure, optional progress and tiles. */
export function StatCard({ label, value, suffix, icon, progress, progressStart, progressEnd, children }: StatCardProps) {
  const colors = useThemeColors();
  return (
    <Card>
      <View className="gap-2">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text variant="overline" tone="subtle">
              {label}
            </Text>
            <Text variant="amount-xl">
              {value}
              {suffix ? (
                <Text variant="body-sm" tone="subtle" style={{ letterSpacing: 0 }}>
                  {"  "}
                  {suffix}
                </Text>
              ) : null}
            </Text>
          </View>
          {icon ? (
            <View className="h-10 w-10 items-center justify-center rounded-md bg-primary-soft">
              <Icon name={icon} size={20} color={colors.primarySoftInk} />
            </View>
          ) : null}
        </View>
        {progress != null ? (
          <ProgressBar value={progress} label={label} startLabel={progressStart} endLabel={progressEnd} />
        ) : null}
        {children}
      </View>
    </Card>
  );
}
