import React from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { floorSchema, FloorFormInput } from "../../src/features/floors/schemas";
import { useCreateFloor } from "../../src/features/floors/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function AddFloor() {
  const { buildingId, buildingName } = useLocalSearchParams<{
    buildingId: string;
    buildingName: string;
  }>();
  const createMutation = useCreateFloor();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FloorFormInput>({
    resolver: zodResolver(floorSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (data: FloorFormInput) => {
    createMutation.mutate(
      { buildingId, data },
      {
        onSuccess: () => {
          Alert.alert("Success", "Floor added successfully.");
          router.back();
        },
        onError: (error: unknown) => {
          Alert.alert("Error", getErrorMessage(error));
        },
      }
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: buildingName ? "Add Floor — " + buildingName : "Add Floor",
        }}
      />
      <View className="flex-1 bg-background p-6">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Floor Name"
              placeholder="e.g. Ground Floor"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
        <Button
          label="Add Floor"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          className="mt-4"
        />
      </View>
    </>
  );
}
