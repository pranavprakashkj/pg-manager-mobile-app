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
import { floorSchema, FloorFormInput } from "../../src/features/floors/schemas";
import { useFloor, useUpdateFloor } from "../../src/features/floors/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";
import type { Floor } from "../../src/types";

function EditFloorForm({ floor }: { floor: Floor }) {
  const updateMutation = useUpdateFloor();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FloorFormInput>({
    resolver: zodResolver(floorSchema),
    defaultValues: { name: floor.name },
  });

  const onSubmit = (data: FloorFormInput) => {
    updateMutation.mutate(
      { id: floor.id, data },
      {
        onSuccess: () => {
          showToast("Floor updated");
          router.back();
        },
        onError: (error: unknown) => setError("root", { message: getErrorMessage(error) }),
      }
    );
  };

  return (
    <FormLayout
      title="Edit Floor"
      subtitle={floor.name}
      submitLabel="Save Changes"
      submitting={updateMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Floor name"
            placeholder="e.g. Ground Floor"
            autoCapitalize="words"
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

export default function EditFloor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: floor, isLoading, isError, error, refetch } = useFloor(id);

  if (floor) return <EditFloorForm floor={floor} />;

  return (
    <Screen>
      <AppBar title="Edit Floor" back />
      {isLoading ? (
        <LoadingState message="Loading floor" rows={1} />
      ) : (
        <ErrorState
          title="Couldn't load this floor"
          message={isError ? getErrorMessage(error) : "This floor is no longer available."}
          onRetry={refetch}
        />
      )}
    </Screen>
  );
}
