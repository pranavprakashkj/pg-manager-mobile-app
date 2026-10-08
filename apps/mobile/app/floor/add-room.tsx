import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppBar } from "../../src/components/ui/AppBar";
import { Banner } from "../../src/components/ui/Banner";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { FilterChips } from "../../src/components/ui/FilterChips";
import { FormLayout } from "../../src/components/ui/FormLayout";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { Screen } from "../../src/components/ui/Screen";
import { Text } from "../../src/components/ui/Text";
import { TextField } from "../../src/components/ui/TextField";
import { showToast } from "../../src/components/ui/Toast";
import { roomSchema, RoomFormInput } from "../../src/features/rooms/schemas";
import { useCreateRoom } from "../../src/features/rooms/hooks";
import { useInventory } from "../../src/features/inventory/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";

export default function AddRoom() {
  const params = useLocalSearchParams<{ floorId?: string; buildingId?: string }>();
  const createMutation = useCreateRoom();
  const { tree, isLoading, isError, error, refetch } = useInventory();

  // Opened from a floor: location is fixed. Opened from the Rooms tab: pick building → floor.
  const [buildingId, setBuildingId] = useState<string | undefined>(params.buildingId);
  const [floorId, setFloorId] = useState<string | undefined>(params.floorId);
  const fixedLocation = !!params.floorId && !!params.buildingId;

  const buildingsWithFloors = useMemo(() => (tree ?? []).filter((b) => b.floors.length > 0), [tree]);
  const selectedBuilding = useMemo(
    () => buildingsWithFloors.find((b) => b.building.id === buildingId) ?? (fixedLocation ? undefined : buildingsWithFloors[0]),
    [buildingsWithFloors, buildingId, fixedLocation]
  );
  const effectiveBuildingId = fixedLocation ? params.buildingId : selectedBuilding?.building.id;
  const effectiveFloorId = fixedLocation
    ? params.floorId
    : selectedBuilding?.floors.find((f) => f.floor.id === floorId)?.floor.id ?? selectedBuilding?.floors[0]?.floor.id;

  const location = useMemo(() => {
    for (const b of tree ?? []) {
      const f = b.floors.find((x) => x.floor.id === effectiveFloorId);
      if (f) return `${b.building.name} · ${f.floor.name}`;
    }
    return undefined;
  }, [tree, effectiveFloorId]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RoomFormInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: { roomNumber: "" },
  });

  const onSubmit = (data: RoomFormInput) => {
    if (!effectiveBuildingId || !effectiveFloorId) {
      setError("root", { message: "Choose a building and floor for this room." });
      return;
    }
    createMutation.mutate(
      { buildingId: effectiveBuildingId, floorId: effectiveFloorId, data },
      {
        onSuccess: () => {
          showToast(`Room ${data.roomNumber.trim()} added`);
          router.back();
        },
        onError: (e: unknown) => setError("root", { message: getErrorMessage(e) }),
      }
    );
  };

  if (!fixedLocation && isLoading) {
    return (
      <Screen>
        <AppBar title="Add Room" back />
        <LoadingState message="Loading buildings" rows={2} />
      </Screen>
    );
  }

  if (!fixedLocation && (isError || !tree)) {
    return (
      <Screen>
        <AppBar title="Add Room" back />
        <ErrorState title="Couldn't load buildings" message={getErrorMessage(error)} onRetry={refetch} />
      </Screen>
    );
  }

  if (!fixedLocation && buildingsWithFloors.length === 0) {
    return (
      <Screen>
        <AppBar title="Add Room" back />
        <View className="flex-1 justify-center p-4">
          <Card>
            <EmptyState
              icon="building"
              title="Add a floor first"
              message="Rooms belong to a floor. Create a building and add a floor to it, then add rooms."
              action={tree && tree.length > 0 ? "Manage Buildings" : "Add Building"}
              actionIcon={tree && tree.length > 0 ? "arrow-right" : "plus"}
              onAction={() =>
                tree && tree.length > 0
                  ? router.replace({
                      pathname: "/building/[id]",
                      params: { id: tree[0].building.id, name: tree[0].building.name },
                    })
                  : router.replace("/building/add")
              }
            />
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <FormLayout
      title="Add Room"
      subtitle={location}
      submitLabel="Add Room"
      submitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      footer={errors.root?.message ? <Banner tone="danger" title="Couldn't add room" message={errors.root.message} /> : null}
    >
      {!fixedLocation && selectedBuilding ? (
        <>
          <View className="gap-1.5">
            <Text variant="label" tone="muted">
              Building
            </Text>
            <FilterChips
              label="Building"
              value={selectedBuilding.building.id}
              onChange={(id) => {
                setBuildingId(id);
                setFloorId(undefined);
              }}
              options={buildingsWithFloors.map((b) => ({ value: b.building.id, label: b.building.name }))}
            />
          </View>
          <View className="gap-1.5">
            <Text variant="label" tone="muted">
              Floor
            </Text>
            <FilterChips
              label="Floor"
              value={effectiveFloorId ?? ""}
              onChange={setFloorId}
              options={selectedBuilding.floors.map((f) => ({ value: f.floor.id, label: f.floor.name, count: f.rooms.length }))}
            />
          </View>
        </>
      ) : null}
      <Controller
        control={control}
        name="roomNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Room number"
            placeholder="e.g. 101"
            icon="door"
            autoCapitalize="characters"
            autoFocus={fixedLocation}
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.roomNumber?.message}
          />
        )}
      />
    </FormLayout>
  );
}
