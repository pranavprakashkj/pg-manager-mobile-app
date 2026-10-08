import React from "react";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "../../src/components/ui/FormLayout";
import { TextField } from "../../src/components/ui/TextField";
import { showToast } from "../../src/components/ui/Toast";
import { buildingSchema, BuildingFormInput } from "../../src/features/buildings/schemas";
import { useCreateBuilding } from "../../src/features/buildings/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function AddBuilding() {
  const createMutation = useCreateBuilding();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BuildingFormInput>({
    resolver: zodResolver(buildingSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (data: BuildingFormInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        showToast(`${data.name.trim()} added`);
        router.back();
      },
      onError: (error: unknown) => setError("root", { message: getErrorMessage(error) }),
    });
  };

  return (
    <FormLayout
      title="Add Building"
      subtitle="A block or property you manage"
      submitLabel="Create Building"
      submitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Building name"
            placeholder="e.g. Block A"
            autoCapitalize="words"
            autoFocus
            icon="building"
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
