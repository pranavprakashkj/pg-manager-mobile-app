import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "./Text";
import { fonts, useThemeColors } from "../../theme/tokens";

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
  tone?: "danger" | "warning";
}

interface FilterChipsProps<T extends string> {
  label: string;
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Horizontally scrolling single-select filter pills (36px tall, 44px hit area). */
export function FilterChips<T extends string>({ label, options, value, onChange }: FilterChipsProps<T>) {
  const colors = useThemeColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={label}
      contentContainerStyle={{ gap: 8 }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={o.count != null ? `${o.label}, ${o.count}` : o.label}
            onPress={() => onChange(o.value)}
            hitSlop={{ top: 4, bottom: 4 }}
            className={`h-9 flex-row items-center gap-1.5 rounded-full border px-3 ${
              selected ? "border-primary bg-primary" : "border-border bg-surface-card active:bg-surface-sunken"
            }`}
          >
            {o.tone ? (
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: selected ? colors.onPrimary : o.tone === "danger" ? colors.danger : colors.warning }}
              />
            ) : null}
            <Text variant="label" tone={selected ? "on-primary" : "muted"} style={{ fontSize: 13 }}>
              {o.label}
            </Text>
            {o.count != null ? (
              <View className={`rounded-full px-1.5 ${selected ? "bg-white/20" : "bg-surface-sunken"}`}>
                <Text variant="tab" tone={selected ? "on-primary" : "muted"} style={{ fontFamily: fonts.bold }}>
                  {o.count > 99 ? "99+" : String(o.count)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
