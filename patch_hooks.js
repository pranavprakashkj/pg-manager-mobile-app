const fs = require('fs');

const rHooks = `import { useQuery, useMutation, useQueryClient } from \"@tanstack/react-query\";
import { roomRepository } from \"./roomRepository\";
import type { RoomFormInput } from \"../../types\";
import { useOrganizationStore } from \"../../stores/organizationStore\";

const ROOMS_KEY = [\"rooms\"] as const;

export function useRooms(floorId: string) {
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
    queryKey: [...ROOMS_KEY, activeOrganizationId, \"detail\", id],
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
      if (!activeOrganizationId) throw new Error(\"No active organization\");
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
      if (!activeOrganizationId) throw new Error(\"No active organization\");
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
      if (!activeOrganizationId) throw new Error(\"No active organization\");
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
    queryKey: [...ROOMS_KEY, activeOrganizationId, \"all-active\"],
    queryFn: () => roomRepository.getAllActive(activeOrganizationId!),
    enabled: !!activeOrganizationId,
  });
}`;
fs.writeFileSync('src/features/rooms/hooks.ts', rHooks);

const bHooks = `import { useQuery, useMutation, useQueryClient } from \"@tanstack/react-query\";
import { bedRepository } from \"./bedRepository\";
import type { BedFormInput, BedUpdateInput } from \"../../types\";
import { useOrganizationStore } from \"../../stores/organizationStore\";

const BEDS_KEY = [\"beds\"] as const;

export function useBedsByFloor(floorId: string) {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  return useQuery({
    queryKey: [...BEDS_KEY, activeOrganizationId, \"floor\", floorId],
    queryFn: () => bedRepository.getByFloorId(activeOrganizationId!, floorId),
    enabled: !!activeOrganizationId && !!floorId,
  });
}

export function useBeds(roomId: string) {
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
    queryKey: [...BEDS_KEY, activeOrganizationId, \"detail\", id],
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
      if (!activeOrganizationId) throw new Error(\"No active organization\");
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
      if (!activeOrganizationId) throw new Error(\"No active organization\");
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
      if (!activeOrganizationId) throw new Error(\"No active organization\");
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
    queryKey: [...BEDS_KEY, activeOrganizationId, \"all-active\"],
    queryFn: () => bedRepository.getAllActive(activeOrganizationId!),
    enabled: !!activeOrganizationId,
  });
}`;
fs.writeFileSync('src/features/beds/hooks.ts', bHooks);
console.log('patched rooms and beds hooks');

