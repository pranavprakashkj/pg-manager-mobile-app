import React from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banner } from "../../src/components/ui/Banner";
import { FormLayout } from "../../src/components/ui/FormLayout";
import { MoneyField } from "../../src/components/ui/MoneyField";
import { TextField } from "../../src/components/ui/TextField";
import { showToast } from "../../src/components/ui/Toast";
import { bedSchema, BedFormInput } from "../../src/features/beds/schemas";
import { useCreateBed } from "../../src/features/beds/hooks";
import { useRoom } from "../../src/features/rooms/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function AddBed() {
  const { roomId, floorId, buildingId } = useLocalSearchParams<{ roomId: string; floorId: string; buildingId: string }>();
  const { data: room } = useRoom(roomId);
  const createMutation = useCreateBed();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BedFormInput>({
    resolver: zodResolver(bedSchema),
    defaultValues: { name: "", defaultMonthlyRate: 0, defaultDailyRate: 0 },
  });

  const onSubmit = (data: BedFormInput) => {
    createMutation.mutate(
      { buildingId, floorId, roomId, data },
      {
        onSuccess: () => {
          showToast(`${data.name.trim()} added`);
          router.back();
        },
        onError: (e: unknown) => setError("root", { message: getErrorMessage(e) }),
      }
    );
  };

  return (
    <FormLayout
      title="Add Bed"
      subtitle={room ? `Room ${room.roomNumber} · starts as Vacant` : "New beds start as Vacant"}
      submitLabel="Add Bed"
      submitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      footer={errors.root?.message ? <Banner tone="danger" title="Couldn't add bed" message={errors.root.message} /> : null}
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Bed name"
            placeholder="e.g. Bed A"
            icon="bed"
            autoCapitalize="words"
            autoFocus
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.name?.message}
          />
        )}
      />
      <View className="flex-row gap-2">
        <Controller
          control={control}
          name="defaultMonthlyRate"
          render={({ field: { onChange, onBlur, value } }) => (
            <MoneyField
              className="flex-1"
              label="Monthly rent"
              placeholder="8500"
              helper="Default per month"
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              error={errors.defaultMonthlyRate?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="defaultDailyRate"
          render={({ field: { onChange, onBlur, value } }) => (
            <MoneyField
              className="flex-1"
              label="Daily rate"
              placeholder="500"
              helper="Default per day"
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              error={errors.defaultDailyRate?.message}
            />
          )}
        />
      </View>
    </FormLayout>
  );
}
