import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { request } from '@/utils/api';
import {
  TerminalSchema,
  ListTerminalsResponseSchema,
  OkResponseSchema,
  type Terminal,
  type CreateTerminalInput,
  type UpdateTerminalInput,
  type ListTerminalsQuery,
  type ListTerminalsResponse,
  type OkResponse,
} from '../schemas/terminals.schema';

const URL = {
  list: 'listTerminals',
  get: 'getTerminal',
  create: 'createTerminal',
  update: 'updateTerminal',
  remove: 'deleteTerminal',
} as const;

export const QUERY_KEY = 'terminals';

export function useTerminalsInfinite(query?: Omit<Partial<ListTerminalsQuery>, 'page'>) {
  const pageSize = query?.pageSize ?? 20;
  return useInfiniteQuery<ListTerminalsResponse, Error>({
    queryKey: [QUERY_KEY, 'infinite', query],
    queryFn: ({ pageParam }) => {
      const data: Record<string, unknown> = { page: pageParam, pageSize };
      if (query?.search) data.search = query.search;
      if (query?.type) data.type = query.type;
      return request(URL.list, { data, schema: ListTerminalsResponseSchema });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.isLastPage ? undefined : lastPage.pagination.page + 1,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useTerminal(id?: string) {
  return useQuery<Terminal, Error>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => request(URL.get, { data: { id }, schema: TerminalSchema }),
    enabled: !!id,
  });
}

export function useCreateTerminal() {
  return useAPIMutation<Terminal, CreateTerminalInput>({
    mutationFn: (data) => request(URL.create, { data, schema: TerminalSchema }),
    successMessage: 'Terminal cadastrado com sucesso',
    errorMessage: 'Falha ao cadastrar terminal',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useUpdateTerminal() {
  return useAPIMutation<OkResponse, { id: string; data: Partial<UpdateTerminalInput> }>({
    mutationFn: (payload) => request(URL.update, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Terminal atualizado',
    errorMessage: 'Falha ao atualizar terminal',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useDeleteTerminal() {
  return useAPIMutation<OkResponse, { id: string }>({
    mutationFn: (payload) => request(URL.remove, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Terminal removido',
    errorMessage: 'Falha ao remover terminal',
    invalidateQueryKey: [QUERY_KEY],
  });
}
