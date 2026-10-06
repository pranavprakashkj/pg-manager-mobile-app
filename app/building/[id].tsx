import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useFloors, useDeactivateFloor } from "../../src/features/floors/hooks";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { showConfirmDialog } from "../../src/components/ui/ConfirmDialog";
import { getErrorMessage } from "../../src/utils/errorUtils";
import type { Floor } from "../../src/types";

function FloorCard({
  floor,
  buildingId,
}: {
  floor: Floor;
  buildingId: string;
}) {
  const deactivateMutation = useDeactivateFloor();

  const handleDeactivate = () => {
    showConfirmDialog({
      title: "Deactivate Floor",
      message:
        "This floor will no longer appear in active property management. Its historical data will be preserved.",
      confirmLabel: "Deactivate",
      destructive: true,
      onConfirm: () => {
        deactivateMutation.mutate(floor.id, {
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
            pathname: "/floor/[id]" as any,
            params: { 
              id: floor.id, 
              name: floor.name, 
              buildingId,
              // We'd ideally pass buildingName too, but for simplicity we can pass it if we have it in scope
            },
          })
        }
      >
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {floor.name}
          </Text>
        </View>
        <Text className="text-gray-400 text-lg">›</Text>
      </TouchableOpacity>
      <View className="flex-row mt-3 gap-2">
        <TouchableOpacity
          className="px-3 py-2 rounded-lg bg-gray-100"
          onPress={() =>
            router.push({
              pathname: "/building/edit-floor" as any,
              params: {
                id: floor.id,
                name: floor.name,
                buildingId,
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

export default function BuildingDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { data: floors, isLoading, isError, error, refetch } = useFloors(id);

  if (isLoading) return <LoadingState message="Loading floors..." />;
  if (isError)
    return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: name || "Building" }} />
      <View className="flex-1 bg-background">
        <FlatList
          data={floors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FloorCard floor={item} buildingId={id} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyState
              title="No Floors"
              message="Add floors to start organizing rooms in this building."
            />
          }
        />
        <View className="absolute bottom-6 left-4 right-4">
          <Button
            label="+ Add Floor"
            onPress={() =>
              router.push({
                pathname: "/building/add-floor" as any,
                params: { buildingId: id, buildingName: name },
              })
            }
          />
        </View>
      </View>
    </>
  );
}
