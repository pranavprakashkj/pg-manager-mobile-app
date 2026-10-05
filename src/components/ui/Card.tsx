import React from "react";
import { View, ViewProps } from "react-native";

export function Card({ children, className = "", ...props }: ViewProps) {
  return (
    <View
      className={`bg-card rounded-2xl p-4 shadow-sm elevation-2 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
