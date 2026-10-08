import React, { forwardRef } from "react";
import { TextInput } from "react-native";
import { TextField, TextFieldProps } from "./TextField";

/**
 * V1-compatible input (auth and onboarding screens). Renders the V2 TextField
 * with the bottom spacing those stacked layouts expect.
 */
export const Input = forwardRef<TextInput, TextFieldProps>(function Input({ className = "", ...props }, ref) {
  return <TextField ref={ref} className={`mb-4 ${className}`} {...props} />;
});
