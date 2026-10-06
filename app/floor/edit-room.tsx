import React from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, RoomFormInput } from "../../src/features/rooms/schemas";
import { useUpdateRoom } from "../../src/features/rooms/hooks";
import { Button } from "../../src/components/ui/Button";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function EditRoom() {
  const { id, roomNumber } = useLocalSearchParams<{ id: string; roomNumber: string }>();
  const updateMutation = useUpdateRoom();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomFormInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: roomNumber || "",
    },
  });

  const onSubmit = (data: RoomFormInput) => {
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
      <Stack.Screen options={{ headerShown: true, title: "Edit Room" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Room Number</Text>
          <Controller
            control={control}
            name="roomNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white border ${
                  errors.roomNumber ? "border-danger" : "border-gray-200"
                } rounded-xl px-4 py-3 text-base`}
                placeholder="e.g. 101"
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="words"
              />
            )}
          />
          {errors.roomNumber && (
            <Text className="text-sm text-danger mt-1">
              {errors.roomNumber.message}
            </Text>
          )}
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
