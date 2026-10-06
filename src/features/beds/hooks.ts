import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bedRepository } from "./bedRepository";
import type { BedFormInput, BedUpdateInput } from "../../types";
import { useOrganizationStore } from "../../stores/organizationStore";

const BEDS_KEY = ["beds"] as const;

export function useBedsByFloor(floorId: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...BEDS_KEY, activeOrganizationId, "floor", floorId],
    queryFn: () => bedRepository.getByFloorId(activeOrganizationId!, floorId),
    enabled: !!activeOrganizationId && !!floorId,
  });
}

export function useBedsByRoom(roomId: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...BEDS_KEY, activeOrganizationId, roomId],
    queryFn: () => bedRepository.getByRoomId(activeOrganizationId!, roomId),
    enabled: !!activeOrganizationId && !!roomId,
  });
}

export function useBed(id: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...BEDS_KEY, activeOrganizationId, "detail", id],
    queryFn: () => bedRepository.getById(activeOrganizationId!, id),
    enabled: !!activeOrganizationId && !!id,
  });
}

export function useCreateBed() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: ({
      buildingId,
      floorId,
      roomId,
      data,
    }: {
      buildingId: string;
      floorId: string;
      roomId: string;
      data: BedFormInput;
    }) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return bedRepository.create(activeOrganizationId, buildingId, floorId, roomId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BEDS_KEY, activeOrganizationId] });
    },
  });
}

export function useUpdateBed() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BedUpdateInput }) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return bedRepository.update(activeOrganizationId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BEDS_KEY, activeOrganizationId] });
    },
  });
}

export function useDeactivateBed() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: (id: string) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return bedRepository.deactivate(activeOrganizationId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BEDS_KEY, activeOrganizationId] });
    },
  });
}

export function useAllActiveBeds() {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...BEDS_KEY, activeOrganizationId, "all-active"],
    queryFn: () => bedRepository.getAllActive(activeOrganizationId!),
    enabled: !!activeOrganizationId,
  });
}