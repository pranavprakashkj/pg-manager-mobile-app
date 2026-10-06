import React from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bedSchema, BedFormInput } from "../../src/features/beds/schemas";
import { useCreateBed } from "../../src/features/beds/hooks";
import { Button } from "../../src/components/ui/Button";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function AddBed() {
  const { roomId, floorId, buildingId } = useLocalSearchParams<{ roomId: string; floorId: string; buildingId: string }>();
  const createMutation = useCreateBed();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BedFormInput>({
    resolver: zodResolver(bedSchema),
    defaultValues: {
      name: "",
      defaultMonthlyRate: 0,
      defaultDailyRate: 0,
    },
  });

  const onSubmit = (data: BedFormInput) => {
    createMutation.mutate(
      { buildingId, floorId, roomId, data },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (error: unknown) => {
          Alert.alert("Error", getErrorMessage(error));
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <Stack.Screen options={{ headerShown: true, title: "Add Bed" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Bed Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white border ${errors.name ? "border-danger" : "border-gray-200"} rounded-xl px-4 py-3 text-base`}
                placeholder="e.g. Bed A"
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="words"
              />
            )}
          />
          {errors.name && <Text className="text-sm text-danger mt-1">{errors.name.message}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Default Monthly Rate (₹)</Text>
          <Controller
            control={control}
            name="defaultMonthlyRate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white border ${errors.defaultMonthlyRate ? "border-danger" : "border-gray-200"} rounded-xl px-4 py-3 text-base`}
                placeholder="e.g. 8500"
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  onChange(isNaN(num) ? 0 : num);
                }}
                value={value ? value.toString() : ""}
                keyboardType="numeric"
              />
            )}
          />
          {errors.defaultMonthlyRate && <Text className="text-sm text-danger mt-1">{errors.defaultMonthlyRate.message}</Text>}
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Default Daily Rate (₹)</Text>
          <Controller
            control={control}
            name="defaultDailyRate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white border ${errors.defaultDailyRate ? "border-danger" : "border-gray-200"} rounded-xl px-4 py-3 text-base`}
                placeholder="e.g. 500"
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  onChange(isNaN(num) ? 0 : num);
                }}
                value={value ? value.toString() : ""}
                keyboardType="numeric"
              />
            )}
          />
          {errors.defaultDailyRate && <Text className="text-sm text-danger mt-1">{errors.defaultDailyRate.message}</Text>}
        </View>

        <Button
          label={createMutation.isPending ? "Adding..." : "Add Bed"}
          onPress={handleSubmit(onSubmit)}
          disabled={createMutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
