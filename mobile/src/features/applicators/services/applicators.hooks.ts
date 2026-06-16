import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { request } from '@/utils/api';
import {
  ApplicatorSchema,
  ListApplicatorsResponseSchema,
  OkResponseSchema,
  type Applicator,
  type CreateApplicatorInput,
  type UpdateApplicatorInput,
  type ListApplicatorsQuery,
  type ListApplicatorsResponse,
  type OkResponse,
} from '../schemas/applicators.schema';

const URL = {
  list: 'listApplicators',
  get: 'getApplicator',
  create: 'createApplicator',
  update: 'updateApplicator',
  remove: 'deleteApplicator',
} as const;

export const QUERY_KEY = 'applicators';

export function useApplicatorsInfinite(query?: Omit<Partial<ListApplicatorsQuery>, 'page'>) {
  const pageSize = query?.pageSize ?? 20;
  return useInfiniteQuery<ListApplicatorsResponse, Error>({
    queryKey: [QUERY_KEY, 'infinite', query],
    queryFn: ({ pageParam }) => {
      const data: Record<string, unknown> = { page: pageParam, pageSize };
      if (query?.search) data.search = query.search;
      return request(URL.list, { data, schema: ListApplicatorsResponseSchema });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.isLastPage ? undefined : lastPage.pagination.page + 1,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useApplicator(id?: string) {
  return useQuery<Applicator, Error>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => request(URL.get, { data: { id }, schema: ApplicatorSchema }),
    enabled: !!id,
  });
}

export function useCreateApplicator() {
  return useAPIMutation<Applicator, CreateApplicatorInput>({
    mutationFn: (data) => request(URL.create, { data, schema: ApplicatorSchema }),
    successMessage: 'Aplicador criado com sucesso',
    errorMessage: 'Falha ao criar aplicador',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useUpdateApplicator() {
  return useAPIMutation<OkResponse, { id: string; data: Partial<UpdateApplicatorInput> }>({
    mutationFn: (payload) => request(URL.update, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Aplicador atualizado',
    errorMessage: 'Falha ao atualizar aplicador',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useDeleteApplicator() {
  return useAPIMutation<OkResponse, { id: string }>({
    mutationFn: (payload) => request(URL.remove, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Aplicador removido',
    errorMessage: 'Falha ao remover aplicador',
    invalidateQueryKey: [QUERY_KEY],
  });
}
