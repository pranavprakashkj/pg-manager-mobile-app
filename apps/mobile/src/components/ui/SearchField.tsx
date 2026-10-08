import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { Icon } from "./Icon";
import { fonts, useThemeColors } from "../../theme/tokens";

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChangeText, placeholder = "Search" }: SearchFieldProps) {
  const colors = useThemeColors();
  return (
    <View className="h-11 flex-row items-center gap-2 rounded-md border border-border bg-surface-card pl-3 pr-1">
      <Icon name="search" size={18} color={colors.inkSubtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSubtle}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        className="h-11 min-w-0 flex-1 text-ink"
        style={{ fontFamily: fonts.medium, fontSize: 14, paddingVertical: 0 }}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText("")}
          className="h-9 w-9 items-center justify-center rounded-md active:bg-surface-sunken"
        >
          <Icon name="x" size={16} color={colors.inkMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
