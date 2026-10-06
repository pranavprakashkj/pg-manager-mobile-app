import React from "react";
import { View, Text } from "react-native";
import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-lg font-semibold text-danger mb-2">Something went wrong</Text>
      <Text className="text-sm text-gray-500 text-center mb-4">{message}</Text>
      {onRetry && <Button label="Retry" variant="outline" onPress={onRetry} />}
    </View>
  );
}
