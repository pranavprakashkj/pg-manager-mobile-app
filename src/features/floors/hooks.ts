import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { floorRepository } from "./floorRepository";
import type { FloorFormData } from "../../types";

const FLOORS_KEY = ["floors"] as const;

export function useAllActiveFloors() {
  return useQuery({
    queryKey: [...FLOORS_KEY, "all-active"],
    queryFn: () => floorRepository.getAllActive(),
  });
}

export function useFloors(buildingId: string) {
  return useQuery({
    queryKey: [...FLOORS_KEY, buildingId],
    queryFn: () => floorRepository.getByBuildingId(buildingId),
    enabled: !!buildingId,
  });
}

export function useFloor(id: string) {
  return useQuery({
    queryKey: [...FLOORS_KEY, "detail", id],
    queryFn: () => floorRepository.getById(id),
    enabled: !!id,
  });
}

export function useCreateFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      buildingId,
      data,
    }: {
      buildingId: string;
      data: FloorFormData;
    }) => {
      const sortOrder = await floorRepository.getNextSortOrder(buildingId);
      return floorRepository.create(buildingId, data, sortOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOORS_KEY });
    },
  });
}

export function useUpdateFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FloorFormData }) =>
      floorRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOORS_KEY });
    },
  });
}

export function useDeactivateFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => floorRepository.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOORS_KEY });
    },
  });
}
