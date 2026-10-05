import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  loading?: boolean;
}

export function Button({ label, variant = "primary", loading, className = "", ...props }: ButtonProps) {
  let bgClass = "bg-primary";
  let textClass = "text-white";

  if (variant === "secondary") {
    bgClass = "bg-gray-200";
    textClass = "text-gray-800";
  } else if (variant === "outline") {
    bgClass = "bg-transparent border border-primary";
    textClass = "text-primary";
  } else if (variant === "danger") {
    bgClass = "bg-danger";
    textClass = "text-white";
  }

  return (
    <TouchableOpacity
      className={`px-4 py-3 rounded-xl flex-row items-center justify-center ${bgClass} ${props.disabled ? "opacity-50" : ""} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#4f46e5" : "#ffffff"} />
      ) : (
        <Text className={`font-semibold text-center ${textClass}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
