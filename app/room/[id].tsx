import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useBedsByRoom, useDeactivateBed } from "../../src/features/beds/hooks";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { showConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { getErrorMessage } from "../../src/utils/errorUtils";
import type { Bed } from "../../src/types";

function getStatusColor(status: string) {
  switch (status) {
    case "vacant": return "text-green-600 bg-green-50";
    case "occupied": return "text-blue-600 bg-blue-50";
    case "reserved": return "text-amber-600 bg-amber-50";
    case "maintenance": return "text-gray-600 bg-gray-100";
    default: return "text-gray-600 bg-gray-100";
  }
}

function BedCard({
  bed,
}: {
  bed: Bed;
}) {
  const deactivateMutation = useDeactivateBed();

  const handleDeactivate = () => {
    if (bed.status === "occupied") {
      Alert.alert("Action Blocked", "Cannot deactivate an occupied bed.");
      return;
    }

    if (bed.status === "reserved" || bed.status === "maintenance") {
      showConfirmDialog({
        title: "Deactivate Bed",
        message: `This bed is currently ${bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}. Are you sure you want to deactivate it?`,
        confirmLabel: "Deactivate",
        destructive: true,
        onConfirm: proceedDeactivate,
      });
      return;
    }
    
    // Vacant
    proceedDeactivate();
  };

  const proceedDeactivate = () => {
    showConfirmDialog({
      title: "Deactivate Bed",
      message: "This bed will no longer appear. Its historical data will be preserved.",
      confirmLabel: "Deactivate",
      destructive: true,
      onConfirm: () => {
        deactivateMutation.mutate(bed.id, {
          onError: (error: unknown) => {
            Alert.alert("Error", getErrorMessage(error));
          },
        });
      },
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {bed.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Monthly: {formatCurrency(bed.defaultMonthlyRate)}
          </Text>
          <Text className="text-sm text-gray-500">
            Daily: {formatCurrency(bed.defaultDailyRate)}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-md ${getStatusColor(bed.status).split(' ')[1]}`}>
          <Text className={`text-xs font-medium ${getStatusColor(bed.status).split(' ')[0]}`}>
            {bed.status}
          </Text>
        </View>
      </View>
      <View className="flex-row mt-3 gap-2">
        <TouchableOpacity
          className="px-3 py-2 rounded-lg bg-gray-100"
          onPress={() =>
            router.push({
              pathname: "/room/edit-bed" as any,
              params: {
                id: bed.id,
                name: bed.name,
                defaultMonthlyRate: bed.defaultMonthlyRate.toString(),
                defaultDailyRate: bed.defaultDailyRate.toString(),
                status: bed.status,
                roomId: bed.roomId,
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

export default function RoomDetail() {
  const { id, roomNumber, buildingId, floorId } = useLocalSearchParams<{ id: string; roomNumber: string; buildingId: string; floorId: string }>();
  
  const { data: beds, isLoading, isError, error, refetch } = useBedsByRoom(id);

  if (isLoading) return <LoadingState message="Loading beds..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: roomNumber ? `Room ${roomNumber}` : "Room" }} />
      <View className="flex-1 bg-background">
        <FlatList
          data={beds}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BedCard bed={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-sm text-gray-500">
                {beds?.length || 0} active {(beds?.length === 1) ? "bed" : "beds"}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="No Beds"
              message="Add beds to start managing this room."
            />
          }
        />
        <View className="absolute bottom-6 left-4 right-4">
          <Button
            label="+ Add Bed"
            onPress={() =>
              router.push({
                pathname: "/room/add-bed" as any,
                params: { roomId: id, floorId, buildingId },
              })
            }
          />
        </View>
      </View>
    </>
  );
}
