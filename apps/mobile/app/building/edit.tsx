import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppBar } from "../../src/components/ui/AppBar";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { FormLayout } from "../../src/components/ui/FormLayout";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { Screen } from "../../src/components/ui/Screen";
import { TextField } from "../../src/components/ui/TextField";
import { showToast } from "../../src/components/ui/Toast";
import { buildingSchema, BuildingFormInput } from "../../src/features/buildings/schemas";
import { useBuilding, useUpdateBuilding } from "../../src/features/buildings/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";
import type { Building } from "../../src/types";

function EditBuildingForm({ building }: { building: Building }) {
  const updateMutation = useUpdateBuilding();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BuildingFormInput>({
    resolver: zodResolver(buildingSchema),
    defaultValues: { name: building.name },
  });

  const onSubmit = (data: BuildingFormInput) => {
    updateMutation.mutate(
      { id: building.id, data },
      {
        onSuccess: () => {
          showToast("Building updated");
          router.back();
        },
        onError: (error: unknown) => setError("root", { message: getErrorMessage(error) }),
      }
    );
  };

  return (
    <FormLayout
      title="Edit Building"
      subtitle={building.name}
      submitLabel="Save Changes"
      submitting={updateMutation.isPending}
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
            icon="building"
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

export default function EditBuilding() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: building, isLoading, isError, error, refetch } = useBuilding(id);

  if (building) return <EditBuildingForm building={building} />;

  return (
    <Screen>
      <AppBar title="Edit Building" back />
      {isLoading ? (
        <LoadingState message="Loading building" rows={1} />
      ) : (
        <ErrorState
          title="Couldn't load this building"
          message={isError ? getErrorMessage(error) : "This building is no longer available."}
          onRetry={refetch}
        />
      )}
    </Screen>
  );
}
