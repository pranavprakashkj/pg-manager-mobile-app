import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="text-gray-700 font-medium mb-1">{label}</Text>}
      <TextInput
        className={`bg-white border rounded-lg px-4 py-3 text-gray-900 ${
          error ? "border-danger" : "border-gray-300"
        }`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="text-danger text-sm mt-1">{error}</Text>}
    </View>
  );
}
