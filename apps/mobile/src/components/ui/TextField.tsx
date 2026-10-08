import React, { forwardRef } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";
import { Icon, IconName } from "./Icon";
import { fonts, useThemeColors } from "../../theme/tokens";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  prefix?: string;
  icon?: IconName;
  size?: "md" | "lg";
  className?: string;
}

/** V2 input: label above, 48px field, 10px radius, error replaces helper text. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, helper, prefix, icon, size = "md", editable = true, className = "", style, ...props },
  ref
) {
  const colors = useThemeColors();
  const help = error || helper;
  const readOnly = editable === false;

  return (
    <View className={`min-w-0 gap-1.5 ${className}`}>
      {label ? (
        <Text variant="label" tone="muted" nativeID={props.nativeID ? `${props.nativeID}-label` : undefined}>
          {label}
        </Text>
      ) : null}
      <View
        className={`min-h-[48px] flex-row items-center gap-2 rounded-md border px-3 ${
          error
            ? "border-danger bg-surface-card"
            : readOnly
              ? "border-transparent bg-surface-sunken"
              : "border-border-control bg-surface-card"
        }`}
      >
        {icon ? <Icon name={icon} size={18} color={colors.inkSubtle} /> : null}
        {prefix ? (
          <Text variant="body-strong" style={size === "lg" ? { fontSize: 20, lineHeight: 26 } : undefined}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={colors.inkSubtle}
          accessibilityLabel={label}
          accessibilityHint={error}
          className="min-h-[46px] min-w-0 flex-1 text-ink"
          style={[
            size === "lg"
              ? { fontFamily: fonts.extrabold, fontSize: 20, fontVariant: ["tabular-nums"] }
              : { fontFamily: fonts.medium, fontSize: 15 },
            { paddingVertical: 0 },
            style,
          ]}
          {...props}
        />
      </View>
      {help ? (
        <View className="flex-row items-start gap-1">
          {error ? <Icon name="alert-circle" size={14} color={colors.danger} /> : null}
          <Text variant="caption" tone={error ? "danger" : "subtle"} className="flex-1">
            {help}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
