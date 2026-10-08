import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { forgotPasswordSchema, ForgotPasswordFormData } from "../../src/features/auth/schemas";
import { authService } from "../../src/features/auth/authService";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await authService.resetPassword(data.email);
      Alert.alert("Success", "Password reset email sent!");
      router.back();
    } catch (error: unknown) {
      Alert.alert("Error", getErrorMessage(error) || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-background">
      <Text className="text-2xl font-jakarta-extrabold text-primary-text mb-6 text-center">Reset Password</Text>
      
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email"
            placeholder="admin@pgmanager.com"
            autoCapitalize="none"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
          />
        )}
      />

      <Button
        label="Send Reset Link"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        className="mt-4"
      />

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.back()}
      >
        <Text className="text-center text-primary-text font-jakarta-bold">Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
