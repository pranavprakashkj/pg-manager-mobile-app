import React from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppBar } from "../../src/components/ui/AppBar";
import { Banner } from "../../src/components/ui/Banner";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { FormLayout } from "../../src/components/ui/FormLayout";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { MoneyField } from "../../src/components/ui/MoneyField";
import { Screen } from "../../src/components/ui/Screen";
import { SegmentedControl } from "../../src/components/ui/SegmentedControl";
import { Text } from "../../src/components/ui/Text";
import { TextField } from "../../src/components/ui/TextField";
import { showToast } from "../../src/components/ui/Toast";
import { bedUpdateSchema, BedUpdateInput } from "../../src/features/beds/schemas";
import { useBed, useUpdateBed } from "../../src/features/beds/hooks";
import { bedStatusLabel, MANUAL_BED_STATUSES } from "../../src/features/inventory/bedStatus";
import { getErrorMessage } from "../../src/utils/errorUtils";
import type { Bed } from "../../src/types";

function EditBedForm({ bed }: { bed: Bed }) {
  const updateMutation = useUpdateBed();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BedUpdateInput>({
    resolver: zodResolver(bedUpdateSchema),
    defaultValues: {
      name: bed.name,
      defaultMonthlyRate: bed.defaultMonthlyRate,
      defaultDailyRate: bed.defaultDailyRate,
      status: bed.status,
    },
  });

  const onSubmit = (data: BedUpdateInput) => {
    updateMutation.mutate(
      { id: bed.id, data },
      {
        onSuccess: () => {
          showToast(`${data.name.trim()} updated`);
          router.back();
        },
        onError: (e: unknown) => setError("root", { message: getErrorMessage(e) }),
      }
    );
  };

  return (
    <FormLayout
      title="Edit Bed"
      subtitle={bed.name}
      submitLabel="Save Changes"
      submitting={updateMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      footer={errors.root?.message ? <Banner tone="danger" title="Couldn't save" message={errors.root.message} /> : null}
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
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              error={errors.defaultDailyRate?.message}
            />
          )}
        />
      </View>
      <View className="gap-1.5">
        <Text variant="label" tone="muted">
          Status
        </Text>
        {bed.status === "occupied" ? (
          <TextField value={bedStatusLabel.occupied} editable={false} icon="lock" helper="Occupied beds can't be changed by hand." />
        ) : (
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <SegmentedControl
                label="Bed status"
                value={value}
                onChange={onChange}
                options={MANUAL_BED_STATUSES.map((s) => ({
                  value: s,
                  label: bedStatusLabel[s],
                  icon: s === "vacant" ? "check" : s === "reserved" ? "clock" : "wrench",
                }))}
              />
            )}
          />
        )}
      </View>
    </FormLayout>
  );
}

export default function EditBed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bed, isLoading, isError, error, refetch } = useBed(id);

  if (bed) return <EditBedForm bed={bed} />;

  return (
    <Screen>
      <AppBar title="Edit Bed" back />
      {isLoading ? (
        <LoadingState message="Loading bed" rows={2} />
      ) : (
        <ErrorState
          title="Couldn't load this bed"
          message={isError ? getErrorMessage(error) : "This bed is no longer available."}
          onRetry={refetch}
        />
      )}
    </Screen>
  );
}
