import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "../../infrastructure/repositories";
import type { RoomFormInput } from "../../types";
import { useOrganizationStore } from "../../stores/organizationStore";

const ROOMS_KEY = ["rooms"] as const;

export function useRoomsByFloor(floorId: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...ROOMS_KEY, activeOrganizationId, floorId],
    queryFn: () => repositories.rooms.getByFloorId(activeOrganizationId!, floorId),
    enabled: !!activeOrganizationId && !!floorId,
  });
}

export function useRoom(id: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...ROOMS_KEY, activeOrganizationId, "detail", id],
    queryFn: () => repositories.rooms.getById(activeOrganizationId!, id),
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
      return repositories.rooms.create(activeOrganizationId, buildingId, floorId, data);
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
      return repositories.rooms.update(activeOrganizationId, id, data);
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
      return repositories.rooms.deactivate(activeOrganizationId, id);
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
    queryFn: () => repositories.rooms.getAllActive(activeOrganizationId!),
    enabled: !!activeOrganizationId,
  });
}