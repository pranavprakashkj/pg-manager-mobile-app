import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useRoomsByFloor, useDeactivateRoom } from "../../src/features/rooms/hooks";
import { useBedsByFloor } from "../../src/features/beds/hooks";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { showConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { getErrorMessage } from "../../src/utils/errorUtils";
import type { Room, Bed } from "../../src/types";

function RoomCard({
  room,
  beds,
}: {
  room: Room;
  beds: Bed[];
}) {
  const deactivateMutation = useDeactivateRoom();

  const handleDeactivate = () => {
    showConfirmDialog({
      title: "Deactivate Room",
      message: "This room will no longer appear. Active beds must be removed first.",
      confirmLabel: "Deactivate",
      destructive: true,
      onConfirm: () => {
        deactivateMutation.mutate(room.id, {
          onError: (error: unknown) => {
            Alert.alert("Error", getErrorMessage(error));
          },
        });
      },
    });
  };

  const bedCount = beds.length;
  
  // Status summary
  const summary = useMemo(() => {
    if (beds.length === 0) return "No beds";
    const counts: Record<string, number> = { vacant: 0, occupied: 0, reserved: 0, maintenance: 0 };
    beds.forEach(b => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    const parts = [];
    if (counts.vacant > 0) parts.push(`${counts.vacant} Vacant`);
    if (counts.occupied > 0) parts.push(`${counts.occupied} Occupied`);
    if (counts.reserved > 0) parts.push(`${counts.reserved} Reserved`);
    if (counts.maintenance > 0) parts.push(`${counts.maintenance} Maintenance`);
    return parts.join(" · ");
  }, [beds]);

  return (
    <Card className="mb-3">
      <TouchableOpacity
        className="flex-row items-center justify-between"
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/room/[id]" as any,
            params: { 
              id: room.id, 
              roomNumber: room.roomNumber,
              floorId: room.floorId,
              buildingId: room.buildingId,
            },
          })
        }
      >
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            Room {room.roomNumber}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {bedCount} {bedCount === 1 ? "Bed" : "Beds"}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {summary}
          </Text>
        </View>
        <Text className="text-gray-400 text-lg">›</Text>
      </TouchableOpacity>
      <View className="flex-row mt-3 gap-2">
        <TouchableOpacity
          className="px-3 py-2 rounded-lg bg-gray-100"
          onPress={() =>
            router.push({
              pathname: "/floor/edit-room" as any,
              params: {
                id: room.id,
                roomNumber: room.roomNumber,
                floorId: room.floorId,
                buildingId: room.buildingId,
              },
            })
          }
        >
          <Text className="text-sm font-medium text-primary">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-3 py-2 rounded-lg bg-red-50"
          onPress={handleDeactivate}
          disabled={deactivateMutation.isPending}
        >
          <Text className="text-sm font-medium text-danger">
            {deactivateMutation.isPending ? "..." : "Deactivate"}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function FloorDetail() {
  const { id, name, buildingId } = useLocalSearchParams<{ id: string; name: string; buildingId: string }>();
  
  const { data: rooms, isLoading: isRoomsLoading, isError: isRoomsError, error: roomsError, refetch: refetchRooms } = useRoomsByFloor(id);
  const { data: beds, isLoading: isBedsLoading, isError: isBedsError, error: bedsError, refetch: refetchBeds } = useBedsByFloor(id);

  const isLoading = isRoomsLoading || isBedsLoading;
  const isError = isRoomsError || isBedsError;
  const error = roomsError || bedsError;

  const bedsByRoom = useMemo(() => {
    if (!beds) return {};
    return beds.reduce((acc, bed) => {
      if (!acc[bed.roomId]) acc[bed.roomId] = [];
      acc[bed.roomId].push(bed);
      return acc;
    }, {} as Record<string, Bed[]>);
  }, [beds]);

  const handleRetry = () => {
    refetchRooms();
    refetchBeds();
  };

  if (isLoading) return <LoadingState message="Loading rooms..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={handleRetry} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: name || "Floor" }} />
      <View className="flex-1 bg-background">
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard 
              room={item} 
              beds={bedsByRoom[item.id] || []} 
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-sm text-gray-500">
                {rooms?.length || 0} active {(rooms?.length === 1) ? "room" : "rooms"}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="No Rooms"
              message="Add rooms to start managing this floor."
            />
          }
        />
        <View className="absolute bottom-6 left-4 right-4">
          <Button
            label="+ Add Room"
            onPress={() =>
              router.push({
                pathname: "/floor/add-room" as any,
                params: { floorId: id, buildingId },
              })
            }
          />
        </View>
      </View>
    </>
  );
}
