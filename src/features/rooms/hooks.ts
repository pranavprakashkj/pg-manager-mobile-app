import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomRepository } from "./roomRepository";
import type { RoomFormInput } from "../../types";
import { useOrganizationStore } from "../../stores/organizationStore";

const ROOMS_KEY = ["rooms"] as const;

export function useRoomsByFloor(floorId: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...ROOMS_KEY, activeOrganizationId, floorId],
    queryFn: () => roomRepository.getByFloorId(activeOrganizationId!, floorId),
    enabled: !!activeOrganizationId && !!floorId,
  });
}

export function useRoom(id: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...ROOMS_KEY, activeOrganizationId, "detail", id],
    queryFn: () => roomRepository.getById(activeOrganizationId!, id),
    enabled: !!activeOrganizationId && !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: ({
      buildingId,
      floorId,
      data,
    }: {
      buildingId: string;
      floorId: string;
      data: RoomFormInput;
    }) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return roomRepository.create(activeOrganizationId, buildingId, floorId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...ROOMS_KEY, activeOrganizationId] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoomFormInput }) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return roomRepository.update(activeOrganizationId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ROOMS_KEY, activeOrganizationId] });
    },
  });
}

export function useDeactivateRoom() {
  const queryClient = useQueryClient();
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useMutation({
    mutationFn: (id: string) => {
      if (!activeOrganizationId) throw new Error("No active organization");
      return roomRepository.deactivate(activeOrganizationId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ROOMS_KEY, activeOrganizationId] });
    },
  });
}

export function useAllActiveRooms() {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...ROOMS_KEY, activeOrganizationId, "all-active"],
    queryFn: () => roomRepository.getAllActive(activeOrganizationId!),
    enabled: !!activeOrganizationId,
  });
}