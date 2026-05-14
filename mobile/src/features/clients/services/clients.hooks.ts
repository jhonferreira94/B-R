import { useInfiniteQuery } from '@tanstack/react-query';
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { request } from '@/utils/api';
import type {
  Client,
  CreateClientInput,
  ListClientsQuery,
  ListClientsResponse,
} from '../schemas/clients.schema';

const URL = {
  list: 'listClients',
  create: 'createClient',
  update: 'updateClient',
  remove: 'deleteClient',
  seed: 'seedClients',
} as const;

const QUERY_KEY = 'clients';

export function useClients(query?: Partial<ListClientsQuery>) {
  return useAPIQuery<ListClientsResponse>({
    url: URL.list,
    method: 'POST',
    queryKey: [QUERY_KEY, query],
    params: query,
  });
}

export function useClientsInfinite(query?: Omit<Partial<ListClientsQuery>, 'page'>) {
  const pageSize = query?.pageSize ?? 20;
  return useInfiniteQuery<ListClientsResponse, Error>({
    queryKey: [QUERY_KEY, 'infinite', query],
    queryFn: ({ pageParam }) => {
      const data: Record<string, unknown> = { page: pageParam, pageSize };
      if (query?.search) data.search = query.search;
      if (query?.isActive !== undefined) data.isActive = query.isActive;
      return request<ListClientsResponse>(URL.list, 'POST', { data });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.isLastPage ? undefined : lastPage.pagination.page + 1,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useCreateClient() {
  return useAPIMutation<Client, CreateClientInput>({
    mutationFn: (data) => request<Client>(URL.create, 'POST', { data }),
    successMessage: 'Cliente criado com sucesso',
    errorMessage: 'Falha ao criar cliente',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useUpdateClient() {
  return useAPIMutation<{ ok: true }, { id: string; data: Partial<CreateClientInput> }>({
    mutationFn: (payload) => request<{ ok: true }>(URL.update, 'POST', { data: payload }),
    successMessage: 'Cliente atualizado',
    errorMessage: 'Falha ao atualizar cliente',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useDeleteClient() {
  return useAPIMutation<{ ok: true }, { id: string }>({
    mutationFn: (payload) => request<{ ok: true }>(URL.remove, 'POST', { data: payload }),
    successMessage: 'Cliente removido',
    errorMessage: 'Falha ao remover cliente',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useSeedClients() {
  return useAPIMutation<{ created: number; skipped: boolean }, void>({
    mutationFn: () => request<{ created: number; skipped: boolean }>(URL.seed, 'POST', { data: {} }),
    successMessage: 'Clientes de exemplo gerados',
    errorMessage: 'Falha ao gerar clientes de exemplo',
    invalidateQueryKey: [QUERY_KEY],
  });
}
