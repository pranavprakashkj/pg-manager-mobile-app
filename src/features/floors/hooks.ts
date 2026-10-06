import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { floorRepository } from "./floorRepository";
import type { FloorFormData } from "../../types";
import { useOrganizationStore } from "../../stores/organizationStore";

const FLOORS_KEY = ["floors"] as const;

export function useAllActiveFloors() {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...FLOORS_KEY, activeOrganizationId, "all-active"],
    queryFn: () => floorRepository.getAllActive(activeOrganizationId!),
    enabled: !!activeOrganizationId,
  });
}

export function useFloors(buildingId: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...FLOORS_KEY, activeOrganizationId, buildingId],
    queryFn: () => floorRepository.getByBuildingId(activeOrganizationId!, buildingId),
    enabled: !!activeOrganizationId && !!buildingId,
  });
}

export function useFloor(id: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...FLOORS_KEY, activeOrganizationId, "detail", id],
    queryFn: () => floorRepository.getById(activeOrganizationId!, id),
    enabled: !!activeOrganizationId && !!id,
  });
}

export function useCreateFloor() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: async ({
      buildingId,
      data,
    }: {
      buildingId: string;
      data: FloorFormData;
    }) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      const sortOrder = await floorRepository.getNextSortOrder(activeOrganizationId, buildingId);
      return floorRepository.create(activeOrganizationId, buildingId, data, sortOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...FLOORS_KEY, activeOrganizationId] });
    },
  });
}

export function useUpdateFloor() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FloorFormData }) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return floorRepository.update(activeOrganizationId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...FLOORS_KEY, activeOrganizationId] });
    },
  });
}

export function useDeactivateFloor() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: (id: string) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return floorRepository.deactivate(activeOrganizationId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...FLOORS_KEY, activeOrganizationId] });
    },
  });
}
