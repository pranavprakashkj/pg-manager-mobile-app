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
import { BottomActionBar, Screen, ScreenScroll } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { Text } from "../../src/components/ui/Text";
import { showConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { showToast } from "../../src/components/ui/Toast";
import { BedTile } from "../../src/features/inventory/components/BedTile";
import { useInventory } from "../../src/features/inventory/hooks";
import { findRoom, monthlyRateRange } from "../../src/features/inventory/inventory";
import { useDeactivateBed, useUpdateBed } from "../../src/features/beds/hooks";
import { useDeactivateRoom } from "../../src/features/rooms/hooks";
import { useThemeColors } from "../../src/theme/tokens";
import { getErrorMessage } from "../../src/utils/errorUtils";
import { formatINR, formatINRRange, pluralize } from "../../src/utils/format";
import type { Bed } from "../../src/types";

function BedCard({ bed }: { bed: Bed }) {
  const updateBed = useUpdateBed();
  const deactivateBed = useDeactivateBed();
  const rates = `${formatINR(bed.defaultMonthlyRate)}/mo · ${formatINR(bed.defaultDailyRate)}/day`;

  const markReady = () => {
    updateBed.mutate(
      {
        id: bed.id,
        data: {
          name: bed.name,
          defaultMonthlyRate: bed.defaultMonthlyRate,
          defaultDailyRate: bed.defaultDailyRate,
          status: "vacant",
        },
      },
      {
        onSuccess: () => showToast(`${bed.name} is ready to assign`),
        onError: (e) => showToast(getErrorMessage(e), "error"),
      }
    );
  };

  const deactivate = () => {
    const note = bed.status === "reserved" ? " It is currently reserved." : "";
    showConfirmDialog({
      title: `Deactivate ${bed.name}?`,
      message: `It will no longer appear in rooms or occupancy. Its history is kept.${note}`,
      confirmLabel: "Deactivate Bed",
      destructive: true,
      onConfirm: () =>
        deactivateBed
          .mutateAsync(bed.id)
          .then(() => showToast(`${bed.name} deactivated`))
          .catch((e) => showToast(getErrorMessage(e), "error")),
    });
  };

  const edit = () => router.push({ pathname: "/room/edit-bed", params: { id: bed.id } });

  return (
    <Card>
      <View className="gap-3">
        <BedTile bed={bed} sub={rates} />
        {bed.status === "maintenance" ? (
          <Text variant="body-sm" tone="muted">
            {"This bed is under repair and can't be assigned until it's marked ready."}
          </Text>
        ) : null}
        {bed.status === "maintenance" ? (
          <Button label="Mark Bed Ready" icon="check" variant="outline" block loading={updateBed.isPending} onPress={markReady} />
        ) : null}
        <View className="flex-row gap-2">
          <Button label="Edit Bed" icon="edit" variant="outline" size="sm" className="flex-1" onPress={edit} />
          {bed.status === "occupied" ? (
            <View className="flex-1 justify-center">
              <Text variant="caption" tone="subtle" className="text-center">
                {"Occupied beds can't be deactivated"}
              </Text>
            </View>
          ) : (
            <Button
              label="Deactivate"
              variant="danger-ghost"
              size="sm"
              className="flex-1"
              loading={deactivateBed.isPending}
              onPress={deactivate}
            />
          )}
        </View>
      </View>
    </Card>
  );
}

export default function RoomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const { tree, isLoading, isError, error, isRefetching, refetch } = useInventory();
  const deactivateRoom = useDeactivateRoom();

  const found = tree ? findRoom(tree, id) : null;

  if (isLoading) {
    return (
      <Screen>
        <AppBar title="Room" back />
        <LoadingState message="Loading room" rows={3} />
      </Screen>
    );
  }

  if (isError || !tree) {
    return (
      <Screen>
        <AppBar title="Room" back />
        <ErrorState title="Couldn't load this room" message={getErrorMessage(error)} onRetry={refetch} />
      </Screen>
    );
  }

  if (!found) {
    return (
      <Screen>
        <AppBar title="Room" back />
        <View className="flex-1 justify-center p-4">
          <Card>
            <EmptyState
              icon="door"
              title="Room not available"
              message="This room may have been deactivated or moved."
              action="Back to Rooms"
              actionIcon="arrow-left"
              onAction={() => router.back()}
            />
          </Card>
        </View>
      </Screen>
    );
  }

  const { building, floor, node } = found;
  const { room, beds, counts } = node;
  const rate = monthlyRateRange(beds);
  const title = `Room ${room.roomNumber}`;

  const deactivate = () =>
    showConfirmDialog({
      title: `Deactivate ${title}?`,
      message: "It will no longer appear in active property management. Its history is kept.",
      confirmLabel: "Deactivate Room",
      destructive: true,
      onConfirm: () =>
        deactivateRoom
          .mutateAsync(room.id)
          .then(() => {
            showToast(`${title} deactivated`);
            router.back();
          })
          .catch((e) => showToast(getErrorMessage(e), "error")),
    });

  return (
    <Screen>
      <AppBar
        title={title}
        subtitle={`${building.name} · ${floor.name}`}
        back
        actions={
          <IconButton
            icon="edit"
            label={`Edit ${title}`}
            onPress={() => router.push({ pathname: "/floor/edit-room", params: { id: room.id, roomNumber: room.roomNumber } })}
          />
        }
      />
      <ScreenScroll
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <Card>
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text variant="overline" tone="subtle">
                {counts.total > 0 ? `${counts.total}-sharing` : "No beds yet"}
              </Text>
              {rate ? (
                <Text variant="amount-xl">
                  {formatINRRange(rate.min, rate.max)}
                  <Text variant="body-sm" tone="subtle" style={{ letterSpacing: 0 }}>
                    {" "}/bed /month
                  </Text>
                </Text>
              ) : (
                <Text variant="body" tone="muted">
                  Add beds to set rent for this room.
                </Text>
              )}
            </View>
            <Badge label={`${counts.occupied} of ${counts.total} occupied`} tone="info" />
          </View>
        </Card>

        <SectionHeader title="Beds" subtitle={beds.length ? "Edit rates or status for each bed" : undefined} />

        {beds.length === 0 ? (
          <Card>
            <EmptyState
              icon="bed"
              title="No beds in this room"
              message="Add beds to start tracking occupancy and rent."
              action="Add Bed"
              actionIcon="plus"
              onAction={() =>
                router.push({
                  pathname: "/room/add-bed",
                  params: { roomId: room.id, floorId: room.floorId, buildingId: room.buildingId },
                })
              }
            />
          </Card>
        ) : (
          beds.map((bed) => <BedCard key={bed.id} bed={bed} />)
        )}

        <Card flush>
          <ListRow
            icon="alert"
            tone="danger"
            title={`Deactivate ${title}`}
            subtitle={
              beds.length > 0
                ? `Blocked · ${pluralize(beds.length, "active bed")} — deactivate them first`
                : "Removes this room from active management"
            }
            trailing={null}
            disabled={beds.length > 0 || deactivateRoom.isPending}
            onPress={deactivate}
          />
        </Card>
      </ScreenScroll>
      {beds.length > 0 ? (
        <BottomActionBar>
          <Button
            label="Add Bed"
            icon="plus"
            size="lg"
            block
            onPress={() =>
              router.push({
                pathname: "/room/add-bed",
                params: { roomId: room.id, floorId: room.floorId, buildingId: room.buildingId },
              })
            }
          />
        </BottomActionBar>
      ) : null}
    </Screen>
  );
}
