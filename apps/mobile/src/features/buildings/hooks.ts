import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "../../infrastructure/repositories";
import type { BuildingFormData } from "../../types";
import { useOrganizationStore } from "../../stores/organizationStore";

export function useBuildings() {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: ["buildings", activeOrganizationId],
    queryFn: () => repositories.buildings.getAll(activeOrganizationId!),
    enabled: !!activeOrganizationId,
  });
}

export function useBuilding(id: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: ["buildings", activeOrganizationId, id],
    queryFn: () => repositories.buildings.getById(activeOrganizationId!, id),
    enabled: !!activeOrganizationId && !!id,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: (data: BuildingFormData) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return repositories.buildings.create(activeOrganizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings", activeOrganizationId] });
    },
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BuildingFormData }) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return repositories.buildings.update(activeOrganizationId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings", activeOrganizationId] });
    },
  });
}

export function useDeactivateBuilding() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: (id: string) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return repositories.buildings.deactivate(activeOrganizationId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings", activeOrganizationId] });
    },
  });
}