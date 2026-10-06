import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bedRepository } from "./bedRepository";
import type { BedFormInput, BedUpdateInput } from "../../types";

export const BEDS_KEY = ["beds"] as const;

export function useBedsByFloor(floorId: string) {
  return useQuery({
    queryKey: [...BEDS_KEY, "by-floor", floorId],
    queryFn: () => bedRepository.getByFloorId(floorId),
    enabled: !!floorId,
  });
}

export function useBedsByRoom(roomId: string) {
  return useQuery({
    queryKey: [...BEDS_KEY, "by-room", roomId],
    queryFn: () => bedRepository.getByRoomId(roomId),
    enabled: !!roomId,
  });
}

export function useAllActiveBeds() {
  return useQuery({
    queryKey: [...BEDS_KEY, "all-active"],
    queryFn: () => bedRepository.getAllActive(),
  });
}

export function useBed(id: string) {
  return useQuery({
    queryKey: [...BEDS_KEY, id],
    queryFn: () => bedRepository.getById(id),
    enabled: !!id,
  });
}

export function useCreateBed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ buildingId, floorId, roomId, data }: { buildingId: string; floorId: string; roomId: string; data: BedFormInput }) =>
      bedRepository.create(buildingId, floorId, roomId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BEDS_KEY });
    },
  });
}

export function useUpdateBed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BedUpdateInput }) =>
      bedRepository.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BEDS_KEY });
    },
  });
}

export function useDeactivateBed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bedRepository.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BEDS_KEY });
    },
  });
}
