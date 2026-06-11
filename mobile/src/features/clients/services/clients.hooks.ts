import { useInfiniteQuery } from '@tanstack/react-query';
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { request } from '@/utils/api';
import {
  ClientSchema,
  ListClientsResponseSchema,
  OkResponseSchema,
  SeedClientsResponseSchema,
  type Client,
  type CreateClientInput,
  type ListClientsQuery,
  type ListClientsResponse,
  type OkResponse,
  type SeedClientsResponse,
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
    queryKey: [QUERY_KEY, query],
    params: query,
    schema: ListClientsResponseSchema,
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
      return request(URL.list, { data, schema: ListClientsResponseSchema });
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
    mutationFn: (data) => request(URL.create, { data, schema: ClientSchema }),
    successMessage: 'Cliente criado com sucesso',
    errorMessage: 'Falha ao criar cliente',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useUpdateClient() {
  return useAPIMutation<OkResponse, { id: string; data: Partial<CreateClientInput> }>({
    mutationFn: (payload) => request(URL.update, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Cliente atualizado',
    errorMessage: 'Falha ao atualizar cliente',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useDeleteClient() {
  return useAPIMutation<OkResponse, { id: string }>({
    mutationFn: (payload) => request(URL.remove, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Cliente removido',
    errorMessage: 'Falha ao remover cliente',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useSeedClients() {
  return useAPIMutation<SeedClientsResponse, void>({
    mutationFn: () => request(URL.seed, { data: {}, schema: SeedClientsResponseSchema }),
    successMessage: 'Clientes de exemplo gerados',
    errorMessage: 'Falha ao gerar clientes de exemplo',
    invalidateQueryKey: [QUERY_KEY],
  });
}
