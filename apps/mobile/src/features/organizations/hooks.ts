import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Organization } from '@pg-manager/domain';
import { repositories } from '../../infrastructure/repositories';

export const ORGANIZATIONS_KEY = ['organizations'];

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => repositories.organizations.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_KEY });
    },
  });
}

export function useOrganization(id: string | null) {
  return useQuery({
    queryKey: [...ORGANIZATIONS_KEY, id],
    queryFn: () => repositories.organizations.getById(id!),
    enabled: !!id,
  });
}

export function useOrganizations(ids: string[]) {
  return useQuery({
    queryKey: [...ORGANIZATIONS_KEY, 'batch', ids],
    queryFn: async () => {
      const orgs = await Promise.all(ids.map(id => repositories.organizations.getById(id)));
      return orgs.filter((o): o is Organization => o !== null);
    },
    enabled: ids.length > 0,
  });
}
