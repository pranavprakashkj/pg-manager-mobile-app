import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildingRepository } from "./buildingRepository";
import type { BuildingFormData } from "../../types";

const BUILDINGS_KEY = ["buildings"] as const;

export function useBuildings() {
  return useQuery({
    queryKey: BUILDINGS_KEY,
    queryFn: () => buildingRepository.getAll(),
  });
}

export function useBuilding(id: string) {
  return useQuery({
    queryKey: [...BUILDINGS_KEY, id],
    queryFn: () => buildingRepository.getById(id),
    enabled: !!id,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BuildingFormData) => buildingRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDINGS_KEY });
    },
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BuildingFormData }) =>
      buildingRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDINGS_KEY });
    },
  });
}

export function useDeactivateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => buildingRepository.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDINGS_KEY });
    },
  });
}
