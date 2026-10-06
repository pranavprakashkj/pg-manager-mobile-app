import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useBuildings, useDeactivateBuilding } from "../../src/features/buildings/hooks";
import { useAllActiveFloors } from "../../src/features/floors/hooks";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { showConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { getErrorMessage } from "../../src/utils/errorUtils";
import type { Building } from "../../src/types";

function BuildingCard({ building, floorCount }: { building: Building; floorCount: number }) {
  const deactivateMutation = useDeactivateBuilding();

  const handleDeactivate = () => {
    showConfirmDialog({
      title: "Deactivate Building",
      message:
        "This building will no longer appear in active property management. Its floors and historical data will be preserved.",
      confirmLabel: "Deactivate",
      destructive: true,
      onConfirm: () => {
        deactivateMutation.mutate(building.id, {
          onError: (error: unknown) => {
            Alert.alert("Error", getErrorMessage(error));
          },
        });
      },
    });
  };

  return (
    <Card className="mb-3">
      <TouchableOpacity
        className="flex-row items-center justify-between"
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/building/[id]",
            params: { id: building.id, name: building.name },
          })
        }
      >
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {building.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {floorCount} {floorCount === 1 ? "floor" : "floors"}
          </Text>
        </View>
        <Text className="text-gray-400 text-lg">›</Text>
      </TouchableOpacity>
      <View className="flex-row mt-3 gap-2">
        <TouchableOpacity
          className="px-3 py-2 rounded-lg bg-gray-100"
          onPress={() =>
            router.push({
              pathname: "/building/edit",
              params: { id: building.id, name: building.name },
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

export default function Rooms() {
  const { data: buildings, isLoading: isBuildingsLoading, isError: isBuildingsError, error: buildingsError, refetch: refetchBuildings } = useBuildings();
  const { data: activeFloors, isLoading: isFloorsLoading, isError: isFloorsError, error: floorsError, refetch: refetchFloors } = useAllActiveFloors();

  const floorCountsByBuilding = useMemo(() => {
    if (!activeFloors) return {};
    return activeFloors.reduce((acc, floor) => {
      acc[floor.buildingId] = (acc[floor.buildingId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [activeFloors]);

  const isLoading = isBuildingsLoading || isFloorsLoading;
  const isError = isBuildingsError || isFloorsError;
  const error = buildingsError || floorsError;

  const handleRetry = () => {
    refetchBuildings();
    refetchFloors();
  };

  if (isLoading) return <LoadingState message="Loading buildings..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={handleRetry} />;

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={buildings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BuildingCard 
            building={item} 
            floorCount={floorCountsByBuilding[item.id] || 0} 
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            title="No Buildings"
            message="Add your first building to start managing your PG property."
          />
        }
      />
      <View className="absolute bottom-6 left-4 right-4">
        <Button
          label="+ Add Building"
          onPress={() => router.push("/building/add")}
        />
      </View>
    </View>
  );
}
