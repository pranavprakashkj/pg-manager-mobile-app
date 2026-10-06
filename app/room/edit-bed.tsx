import React from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bedUpdateSchema, BedUpdateInput } from "../../src/features/beds/schemas";
import { useUpdateBed } from "../../src/features/beds/hooks";
import { Button } from "../../src/components/ui/Button";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function EditBed() {
  const { id, name, defaultMonthlyRate, defaultDailyRate, status } = useLocalSearchParams<{ 
    id: string; name: string; defaultMonthlyRate: string; defaultDailyRate: string; status: any; 
  }>();
  const updateMutation = useUpdateBed();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BedUpdateInput>({
    resolver: zodResolver(bedUpdateSchema),
    defaultValues: {
      name: name || "",
      defaultMonthlyRate: parseInt(defaultMonthlyRate || "0", 10),
      defaultDailyRate: parseInt(defaultDailyRate || "0", 10),
      status: status || "vacant",
    },
  });

  const currentStatus = watch("status");

  const onSubmit = (data: BedUpdateInput) => {
    updateMutation.mutate(
      { id, data },
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
      <Stack.Screen options={{ headerShown: true, title: "Edit Bed" }} />
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

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Status</Text>
          {status === "occupied" ? (
            <View className="px-4 py-3 rounded-xl border bg-gray-50 border-gray-200">
              <Text className="text-gray-700 font-medium">Occupied</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {["vacant", "reserved", "maintenance"].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setValue("status", s as any)}
                  className={`px-4 py-2 rounded-lg border ${currentStatus === s ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`${currentStatus === s ? 'text-white' : 'text-gray-700'} font-medium`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.status && <Text className="text-sm text-danger mt-1">{errors.status.message}</Text>}
        </View>

        <Button
          label={updateMutation.isPending ? "Saving..." : "Save Changes"}
          onPress={handleSubmit(onSubmit)}
          disabled={updateMutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
