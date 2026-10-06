import React from "react";
import { View, Alert } from "react-native";
import { router, Stack } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { buildingSchema, BuildingFormInput } from "../../src/features/buildings/schemas";
import { useCreateBuilding } from "../../src/features/buildings/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function AddBuilding() {
  const createMutation = useCreateBuilding();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BuildingFormInput>({
    resolver: zodResolver(buildingSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (data: BuildingFormInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert("Success", "Building created successfully.");
        router.back();
      },
      onError: (error: unknown) => {
        Alert.alert("Error", getErrorMessage(error));
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Add Building" }} />
      <View className="flex-1 bg-background p-6">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Building Name"
              placeholder="e.g. Block A"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
        <Button
          label="Create Building"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          className="mt-4"
        />
      </View>
    </>
  );
}
