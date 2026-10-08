import { useMemo } from "react";
import { useBuildings } from "../buildings/hooks";
import { useAllActiveFloors } from "../floors/hooks";
import { useAllActiveRooms } from "../rooms/hooks";
import { useAllActiveBeds } from "../beds/hooks";
import { buildInventoryTree, BuildingNode } from "./inventory";

/**
 * Whole-organization inventory tree for the Rooms tab and room/bed screens.
 * Composes the existing tenant-scoped queries (their cache keys already
 * include organizationId), so mutations elsewhere invalidate it automatically.
 */
export function useInventory() {
  const buildings = useBuildings();
  const floors = useAllActiveFloors();
  const rooms = useAllActiveRooms();
  const beds = useAllActiveBeds();
  const queries = [buildings, floors, rooms, beds];

  const tree = useMemo<BuildingNode[] | undefined>(() => {
    if (!buildings.data || !floors.data || !rooms.data || !beds.data) return undefined;
    return buildInventoryTree(buildings.data, floors.data, rooms.data, beds.data);
  }, [buildings.data, floors.data, rooms.data, beds.data]);

  return {
    tree,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
    error: queries.find((q) => q.error)?.error ?? null,
    isRefetching: queries.some((q) => q.isRefetching),
    refetch: () => Promise.all(queries.map((q) => q.refetch())),
  };
}
