import React from "react";
import { Platform, View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  /** Removes padding so list rows can run edge to edge. */
  flush?: boolean;
  attention?: "danger" | "warning";
  className?: string;
}

const iosShadow = Platform.select({
  ios: { shadowColor: "#0F172A", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  default: undefined,
});

/** V2 card: 16px radius, hairline border, resting shadow. */
export function Card({ flush, attention, className = "", style, children, ...props }: CardProps) {
  const border = attention === "danger" ? "border-danger" : attention === "warning" ? "border-warning" : "border-border";
  return (
    <View
      className={`rounded-lg border bg-surface-card ${border} ${flush ? "overflow-hidden" : "p-4"} ${className}`}
      style={[iosShadow, style]}
      {...props}
    >
      {children}
    </View>
  );
}
