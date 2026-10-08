import React from "react";
import { View } from "react-native";
import { Skeleton, SkeletonRow } from "./Skeleton";

interface LoadingStateProps {
  /** Announced to screen readers; the skeleton itself is hidden from them. */
  message?: string;
  rows?: number;
  /** Adds the two KPI tiles shown above lists on overview screens. */
  withSummary?: boolean;
}

/** Skeleton screen shaped like the content it replaces. */
export function LoadingState({ message = "Loading", rows = 4, withSummary }: LoadingStateProps) {
  return (
    <View className="flex-1 gap-3 p-4" accessible accessibilityLabel={message} accessibilityState={{ busy: true }}>
      {withSummary ? (
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Skeleton height={72} radius={10} />
          </View>
          <View className="flex-1">
            <Skeleton height={72} radius={10} />
          </View>
        </View>
      ) : null}
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}
