import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Text";
import { Icon, IconName } from "./Icon";
import { useThemeColors } from "../../theme/tokens";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Equal-width single-choice buttons (radio group semantics). */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  const colors = useThemeColors();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} className="flex-row gap-2">
      {options.map((o) => {
        const checked = o.value === value;
        const color = checked ? colors.onPrimary : colors.inkMuted;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked, disabled: !!o.disabled }}
            disabled={o.disabled}
            onPress={() => onChange(o.value)}
            className={`min-h-[44px] flex-1 items-center justify-center gap-1 rounded-md border p-2 ${
              checked ? "border-primary bg-primary" : "border-border-control bg-surface-card active:bg-surface-sunken"
            } ${o.disabled ? "opacity-50" : ""}`}
          >
            {o.icon ? <Icon name={o.icon} size={18} color={color} /> : null}
            <Text variant="button" tone="inherit" style={{ color, fontSize: 13, lineHeight: 16 }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
