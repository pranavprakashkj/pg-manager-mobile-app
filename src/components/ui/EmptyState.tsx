import React from "react";
import { View, Text } from "react-native";

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-lg font-semibold text-gray-500 mb-2">{title}</Text>
      <Text className="text-sm text-gray-400 text-center">{message}</Text>
    </View>
  );
}
