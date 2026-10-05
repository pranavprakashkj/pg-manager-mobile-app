import React from "react";
import { View, Text } from "react-native";

export type StatusType = "success" | "warning" | "danger" | "inactive" | "reserved" | "maintenance";

interface StatusBadgeProps {
  label: string;
  type: StatusType;
}

export function StatusBadge({ label, type }: StatusBadgeProps) {
  let bgClass = "bg-gray-100";
  let textClass = "text-gray-600";

  switch (type) {
    case "success":
      bgClass = "bg-green-100";
      textClass = "text-success";
      break;
    case "warning":
      bgClass = "bg-amber-100";
      textClass = "text-warning";
      break;
    case "danger":
      bgClass = "bg-red-100";
      textClass = "text-danger";
      break;
    case "inactive":
      bgClass = "bg-gray-100";
      textClass = "text-inactive";
      break;
    case "reserved":
      bgClass = "bg-purple-100";
      textClass = "text-reserved";
      break;
    case "maintenance":
      bgClass = "bg-neutral-200";
      textClass = "text-maintenance";
      break;
  }

  return (
    <View className={`px-2 py-1 rounded-full self-start ${bgClass}`}>
      <Text className={`text-xs font-semibold uppercase tracking-wider ${textClass}`}>
        {label}
      </Text>
    </View>
  );
}
