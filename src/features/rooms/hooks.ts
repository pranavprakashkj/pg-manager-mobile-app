import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomRepository } from "./roomRepository";
import type { RoomFormInput } from "../../types";

export const ROOMS_KEY = ["rooms"] as const;

export function useRoomsByFloor(floorId: string) {
  return useQuery({
    queryKey: [...ROOMS_KEY, "by-floor", floorId],
    queryFn: () => roomRepository.getByFloorId(floorId),
    enabled: !!floorId,
  });
}

export function useAllActiveRooms() {
  return useQuery({
    queryKey: [...ROOMS_KEY, "all-active"],
    queryFn: () => roomRepository.getAllActive(),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: [...ROOMS_KEY, id],
    queryFn: () => roomRepository.getById(id),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ buildingId, floorId, data }: { buildingId: string; floorId: string; data: RoomFormInput }) =>
      roomRepository.create(buildingId, floorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoomFormInput }) =>
      roomRepository.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
    },
  });
}

export function useDeactivateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomRepository.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
    },
  });
}
