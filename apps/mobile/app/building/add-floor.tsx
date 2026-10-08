import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "../../src/components/ui/FormLayout";
import { TextField } from "../../src/components/ui/TextField";
import { showToast } from "../../src/components/ui/Toast";
import { floorSchema, FloorFormInput } from "../../src/features/floors/schemas";
import { useCreateFloor } from "../../src/features/floors/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function AddFloor() {
  const { buildingId, buildingName } = useLocalSearchParams<{
    buildingId: string;
    buildingName?: string;
  }>();
  const createMutation = useCreateFloor();
  const {
    control,
    handleSubmit,
    setError,
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
          showToast(`${data.name.trim()} added`);
          router.back();
        },
        onError: (error: unknown) => setError("root", { message: getErrorMessage(error) }),
      }
    );
  };

  return (
    <FormLayout
      title="Add Floor"
      subtitle={buildingName || undefined}
      submitLabel="Add Floor"
      submitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Floor name"
            placeholder="e.g. Ground Floor"
            helper="Floors appear in the order you add them."
            autoCapitalize="words"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.name?.message ?? errors.root?.message}
          />
        )}
      />
    </FormLayout>
  );
}
