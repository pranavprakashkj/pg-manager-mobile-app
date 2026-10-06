const fs = require('fs');
let content = fs.readFileSync('src/features/beds/hooks.ts', 'utf8');

content = content.replace('import type { BedFormInput, BedUpdateInput } from \"../../types\";', 'import type { BedFormInput, BedUpdateInput } from \"../../types\";\nimport { useOrganizationStore } from \"../../stores/organizationStore\";');

content = content.replace(
  'export function useBeds(roomId: string) {',
  'export function useBeds(roomId: string) {\n  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);'
);
content = content.replace(
  'queryKey: [...BEDS_KEY, roomId],',
  'queryKey: [...BEDS_KEY, activeOrganizationId, roomId],'
);
content = content.replace(
  'queryFn: () => bedRepository.getByRoomId(roomId),',
  'queryFn: () => bedRepository.getByRoomId(activeOrganizationId!, roomId),'
);
content = content.replace(
  'enabled: !!roomId,',
  'enabled: !!activeOrganizationId && !!roomId,'
);

content = content.replace(
  'export function useBed(id: string) {',
  'export function useBed(id: string) {\n  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);'
);
content = content.replace(
  'queryKey: [...BEDS_KEY, \"detail\", id],',
  'queryKey: [...BEDS_KEY, activeOrganizationId, \"detail\", id],'
);
content = content.replace(
  'queryFn: () => bedRepository.getById(id),',
  'queryFn: () => bedRepository.getById(activeOrganizationId!, id),'
);
content = content.replace(
  'enabled: !!id,',
  'enabled: !!activeOrganizationId && !!id,'
);

content = content.replace(
  'export function useCreateBed() {\n  const queryClient = useQueryClient();',
  'export function useCreateBed() {\n  const queryClient = useQueryClient();\n  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);'
);
content = content.replace(
  'return bedRepository.create(buildingId, floorId, roomId, data);',
  'if (!activeOrganizationId) throw new Error(\"No active organization\");\n      return bedRepository.create(activeOrganizationId, buildingId, floorId, roomId, data);'
);
content = content.replace(
  'queryClient.invalidateQueries({ queryKey: BEDS_KEY });',
  'queryClient.invalidateQueries({ queryKey: [...BEDS_KEY, activeOrganizationId] });'
);

content = content.replace(
  'export function useUpdateBed() {\n  const queryClient = useQueryClient();',
  'export function useUpdateBed() {\n  const queryClient = useQueryClient();\n  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);'
);
content = content.replace(
  'mutationFn: ({ id, data }: { id: string; data: BedUpdateInput }) =>\n      bedRepository.update(id, data),',
  'mutationFn: ({ id, data }: { id: string; data: BedUpdateInput }) => {\n      if (!activeOrganizationId) throw new Error(\"No active organization\");\n      return bedRepository.update(activeOrganizationId, id, data);\n    },'
);
content = content.replace(
  'queryClient.invalidateQueries({ queryKey: BEDS_KEY });',
  'queryClient.invalidateQueries({ queryKey: [...BEDS_KEY, activeOrganizationId] });'
);

content = content.replace(
  'export function useDeactivateBed() {\n  const queryClient = useQueryClient();',
  'export function useDeactivateBed() {\n  const queryClient = useQueryClient();\n  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);'
);
content = content.replace(
  'mutationFn: (id: string) => bedRepository.deactivate(id),',
  'mutationFn: (id: string) => {\n      if (!activeOrganizationId) throw new Error(\"No active organization\");\n      return bedRepository.deactivate(activeOrganizationId, id);\n    },'
);
content = content.replace(
  'queryClient.invalidateQueries({ queryKey: BEDS_KEY });',
  'queryClient.invalidateQueries({ queryKey: [...BEDS_KEY, activeOrganizationId] });'
);

content = content.replace(
  'export function useAllActiveBeds() {',
  'export function useAllActiveBeds() {\n  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);'
);
content = content.replace(
  'queryKey: [...BEDS_KEY, \"all-active\"],',
  'queryKey: [...BEDS_KEY, activeOrganizationId, \"all-active\"],'
);
content = content.replace(
  'queryFn: () => bedRepository.getAllActive(),',
  'queryFn: () => bedRepository.getAllActive(activeOrganizationId!),\n    enabled: !!activeOrganizationId,'
);

fs.writeFileSync('src/features/beds/hooks.ts', content);

