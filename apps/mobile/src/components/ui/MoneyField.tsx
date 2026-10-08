import React from "react";
import { TextField, TextFieldProps } from "./TextField";

interface MoneyFieldProps extends Omit<TextFieldProps, "value" | "onChange" | "onChangeText" | "keyboardType" | "prefix"> {
  value: number;
  onChange: (value: number) => void;
}

/** Whole-rupee amount input. Empty input is treated as 0, matching the bed schema. */
export function MoneyField({ value, onChange, ...props }: MoneyFieldProps) {
  return (
    <TextField
      prefix="₹"
      keyboardType="number-pad"
      inputMode="numeric"
      value={value ? String(value) : ""}
      onChangeText={(text) => {
        const digits = text.replace(/[^0-9]/g, "");
        onChange(digits ? parseInt(digits, 10) : 0);
      }}
      {...props}
    />
  );
}
