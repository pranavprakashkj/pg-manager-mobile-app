import React, { useMemo } from "react";
import { RefreshControl, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppBar } from "../../src/components/ui/AppBar";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { IconButton } from "../../src/components/ui/IconButton";
import { ListRow } from "../../src/components/ui/ListRow";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { MetricTile, MetricTiles } from "../../src/components/ui/MetricTile";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { BottomActionBar, Screen, ScreenScroll } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { Text } from "../../src/components/ui/Text";
import { showConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { showToast } from "../../src/components/ui/Toast";
import { useDeactivateBuilding } from "../../src/features/buildings/hooks";
import { useInventory } from "../../src/features/inventory/hooks";
import { occupancyRate } from "../../src/features/inventory/inventory";
import { useThemeColors } from "../../src/theme/tokens";
import { getErrorMessage } from "../../src/utils/errorUtils";
import { pluralize } from "../../src/utils/format";

export default function BuildingDetail() {
  const { id, name: nameParam } = useLocalSearchParams<{ id: string; name?: string }>();
  const colors = useThemeColors();
  const { tree, isLoading, isError, error, isRefetching, refetch } = useInventory();
  const deactivateBuilding = useDeactivateBuilding();

  const node = useMemo(() => tree?.find((b) => b.building.id === id) ?? null, [tree, id]);
  const fallbackTitle = nameParam || "Building";

  if (isLoading) {
    return (
      <Screen>
        <AppBar title={fallbackTitle} back />
        <LoadingState message="Loading building" rows={3} withSummary />
      </Screen>
    );
  }

  if (isError || !tree) {
    return (
      <Screen>
        <AppBar title={fallbackTitle} back />
        <ErrorState title="Couldn't load this building" message={getErrorMessage(error)} onRetry={refetch} />
      </Screen>
    );
  }

  if (!node) {
    return (
      <Screen>
        <AppBar title={fallbackTitle} back />
        <View className="flex-1 justify-center p-4">
          <Card>
            <EmptyState
              icon="building"
              title="Building not available"
              message="This building may have been deactivated."
              action="Back to Rooms"
              actionIcon="arrow-left"
              onAction={() => router.back()}
            />
          </Card>
        </View>
      </Screen>
    );
  }

  const { building, floors, counts } = node;
  const rate = occupancyRate(counts);

  const addFloor = () =>
    router.push({ pathname: "/building/add-floor", params: { buildingId: building.id, buildingName: building.name } });

  const deactivate = () =>
    showConfirmDialog({
      title: `Deactivate ${building.name}?`,
      message: "It will no longer appear in active property management. Its floors and history are kept.",
      confirmLabel: "Deactivate Building",
      destructive: true,
      onConfirm: () =>
        deactivateBuilding
          .mutateAsync(building.id)
          .then(() => {
            showToast(`${building.name} deactivated`);
            router.back();
          })
          .catch((e) => showToast(getErrorMessage(e), "error")),
    });

  return (
    <Screen>
      <AppBar
        title={building.name}
        subtitle={`${pluralize(floors.length, "floor")} · ${pluralize(node.roomCount, "room")} · ${pluralize(counts.total, "bed")}`}
        back
        actions={
          <IconButton
            icon="edit"
            label={`Edit ${building.name}`}
            onPress={() => router.push({ pathname: "/building/edit", params: { id: building.id, name: building.name } })}
          />
        }
      />
      <ScreenScroll
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <Card>
          <View className="gap-3">
            <View>
              <Text variant="overline" tone="subtle">
                Occupancy
              </Text>
              <Text variant="title-lg">{counts.total ? `${rate}% filled` : "No beds yet"}</Text>
            </View>
            <ProgressBar
              value={rate}
              label={`${building.name} occupancy`}
              startLabel={`${counts.occupied} of ${pluralize(counts.total, "bed")} occupied`}
              endLabel={`${counts.vacant} free`}
            />
            <MetricTiles>
              <MetricTile label="Occupied" dot="info" value={String(counts.occupied)} />
              <MetricTile label="Vacant" dot="success" value={String(counts.vacant)} sub="Ready" />
              <MetricTile label="Reserved" dot="warning" value={String(counts.reserved)} />
              <MetricTile label="Repair" dot="neutral" value={String(counts.maintenance)} />
            </MetricTiles>
          </View>
        </Card>

        <SectionHeader title="Floors" subtitle={floors.length ? "Tap a floor to manage its rooms" : undefined} />

        {floors.length === 0 ? (
          <Card>
            <EmptyState
              icon="building"
              title="No floors yet"
              message="Add floors to start organizing rooms in this building."
              action="Add Floor"
              actionIcon="plus"
              onAction={addFloor}
            />
          </Card>
        ) : (
          <Card flush>
            {floors.map((f, i) => (
              <ListRow
                key={f.floor.id}
                divider={i > 0}
                icon="door"
                title={f.floor.name}
                subtitle={`${pluralize(f.rooms.length, "room")} · ${f.counts.occupied} of ${pluralize(f.counts.total, "bed")} occupied`}
                meta={f.counts.vacant ? `${f.counts.vacant} free` : undefined}
                onPress={() =>
                  router.push({
                    pathname: "/floor/[id]",
                    params: { id: f.floor.id, name: f.floor.name, buildingId: building.id },
                  })
                }
              />
            ))}
          </Card>
        )}

        <Card flush>
          <ListRow
            icon="alert"
            tone="danger"
            title={`Deactivate ${building.name}`}
            subtitle="Hides it from active management · history is kept"
            trailing={null}
            disabled={deactivateBuilding.isPending}
            onPress={deactivate}
          />
        </Card>
      </ScreenScroll>
      {floors.length > 0 ? (
        <BottomActionBar>
          <Button label="Add Floor" icon="plus" size="lg" block onPress={addFloor} />
        </BottomActionBar>
      ) : null}
    </Screen>
  );
}
