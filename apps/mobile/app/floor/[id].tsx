import React from "react";
import { RefreshControl, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppBar } from "../../src/components/ui/AppBar";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { IconButton } from "../../src/components/ui/IconButton";
import { ListRow } from "../../src/components/ui/ListRow";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { BottomActionBar, Screen, ScreenScroll } from "../../src/components/ui/Screen";
import { Text } from "../../src/components/ui/Text";
import { showConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { showToast } from "../../src/components/ui/Toast";
import { useDeactivateFloor } from "../../src/features/floors/hooks";
import { RoomCard } from "../../src/features/inventory/components/RoomCard";
import { useInventory } from "../../src/features/inventory/hooks";
import { findFloor, hasOpenBeds, occupancyRate } from "../../src/features/inventory/inventory";
import { useThemeColors } from "../../src/theme/tokens";
import { getErrorMessage } from "../../src/utils/errorUtils";
import { pluralize } from "../../src/utils/format";

export default function FloorDetail() {
  const { id, name: nameParam } = useLocalSearchParams<{ id: string; name?: string; buildingId?: string }>();
  const colors = useThemeColors();
  const { tree, isLoading, isError, error, isRefetching, refetch } = useInventory();
  const deactivateFloor = useDeactivateFloor();

  const found = tree ? findFloor(tree, id) : null;

  const fallbackTitle = nameParam || "Floor";

  if (isLoading) {
    return (
      <Screen>
        <AppBar title={fallbackTitle} back />
        <LoadingState message="Loading rooms" rows={3} />
      </Screen>
    );
  }

  if (isError || !tree) {
    return (
      <Screen>
        <AppBar title={fallbackTitle} back />
        <ErrorState title="Couldn't load this floor" message={getErrorMessage(error)} onRetry={refetch} />
      </Screen>
    );
  }

  if (!found) {
    return (
      <Screen>
        <AppBar title={fallbackTitle} back />
        <View className="flex-1 justify-center p-4">
          <Card>
            <EmptyState
              icon="door"
              title="Floor not available"
              message="This floor may have been deactivated."
              action="Go Back"
              actionIcon="arrow-left"
              onAction={() => router.back()}
            />
          </Card>
        </View>
      </Screen>
    );
  }

  const { building, node } = found;
  const { floor, rooms, counts } = node;
  const rate = occupancyRate(counts);

  const addRoom = () =>
    router.push({ pathname: "/floor/add-room", params: { floorId: floor.id, buildingId: floor.buildingId } });

  const deactivate = () =>
    showConfirmDialog({
      title: `Deactivate ${floor.name}?`,
      message: "It will no longer appear in active property management. Its history is kept.",
      confirmLabel: "Deactivate Floor",
      destructive: true,
      onConfirm: () =>
        deactivateFloor
          .mutateAsync(floor.id)
          .then(() => {
            showToast(`${floor.name} deactivated`);
            router.back();
          })
          .catch((e) => showToast(getErrorMessage(e), "error")),
    });

  return (
    <Screen>
      <AppBar
        title={floor.name}
        subtitle={`${building.name} · ${pluralize(rooms.length, "room")}`}
        back
        actions={
          <IconButton
            icon="edit"
            label={`Edit ${floor.name}`}
            onPress={() =>
              router.push({ pathname: "/building/edit-floor", params: { id: floor.id, name: floor.name, buildingId: building.id } })
            }
          />
        }
      />
      <ScreenScroll
        gap={12}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <Card>
          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <View>
                <Text variant="overline" tone="subtle">
                  {pluralize(rooms.length, "room")} · {pluralize(counts.total, "bed")}
                </Text>
                <Text variant="title-lg">{counts.total ? `${rate}% occupancy` : "No beds yet"}</Text>
              </View>
              {counts.total ? (
                <Badge
                  label={counts.vacant ? pluralize(counts.vacant, "vacancy", "vacancies") : "Fully occupied"}
                  tone={counts.vacant ? "info" : "neutral"}
                />
              ) : null}
            </View>
            {counts.total ? (
              <ProgressBar
                value={rate}
                label={`${floor.name} occupancy`}
                startLabel={`${counts.occupied} of ${pluralize(counts.total, "bed")} occupied`}
                endLabel={`${counts.vacant} free`}
              />
            ) : null}
          </View>
        </Card>

        {rooms.length === 0 ? (
          <Card>
            <EmptyState
              icon="door"
              title="No rooms on this floor"
              message="Add rooms to start managing beds on this floor."
              action="Add Room"
              actionIcon="plus"
              onAction={addRoom}
            />
          </Card>
        ) : (
          rooms.map((r) => (
            <RoomCard
              key={r.room.id}
              node={r}
              expanded={hasOpenBeds(r)}
              onPress={() =>
                router.push({
                  pathname: "/room/[id]",
                  params: { id: r.room.id, roomNumber: r.room.roomNumber, floorId: floor.id, buildingId: building.id },
                })
              }
              onPressBed={(bed) =>
                router.push({ pathname: "/room/[id]", params: { id: bed.roomId, floorId: floor.id, buildingId: building.id } })
              }
            />
          ))
        )}

        <Card flush>
          <ListRow
            icon="alert"
            tone="danger"
            title={`Deactivate ${floor.name}`}
            subtitle="Hides it from active management · history is kept"
            trailing={null}
            disabled={deactivateFloor.isPending}
            onPress={deactivate}
          />
        </Card>
      </ScreenScroll>
      {rooms.length > 0 ? (
        <BottomActionBar>
          <Button label="Add Room" icon="plus" size="lg" block onPress={addRoom} />
        </BottomActionBar>
      ) : null}
    </Screen>
  );
}
