import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { loginSchema, LoginFormData } from "../../src/features/auth/schemas";
import { authService } from "../../src/features/auth/authService";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await authService.login(data.email, data.password);
      // The auth state listener in _layout.tsx will handle the redirect
    } catch (error: unknown) {
      Alert.alert("Login Error", getErrorMessage(error) || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-background">
      <Text className="text-3xl font-bold text-primary mb-8 text-center">PG Manager</Text>
      
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

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
          />
        )}
      />

      <Button
        label="Login"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        className="mt-4"
      />

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.push("/(auth)/forgot-password")}
      >
        <Text className="text-center text-primary font-medium">Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}
