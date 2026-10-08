import React, { useEffect, useState } from "react";
import { Animated, DimensionValue, View } from "react-native";
import { Card } from "./Card";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}

/** Pulsing placeholder block on the sunken surface. */
export function Skeleton({ width = "100%", height = 12, radius = 6 }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className="bg-surface-sunken"
      style={{ width, height, borderRadius: radius, opacity }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** Card-shaped skeleton matching a list row (avatar, two lines, trailing figure). */
export function SkeletonRow() {
  return (
    <Card className="flex-row items-center gap-3">
      <Skeleton width={40} height={40} radius={20} />
      <View className="flex-1 gap-2">
        <Skeleton width="55%" height={12} />
        <Skeleton width="35%" height={10} />
      </View>
      <Skeleton width={56} height={16} />
    </Card>
  );
}
