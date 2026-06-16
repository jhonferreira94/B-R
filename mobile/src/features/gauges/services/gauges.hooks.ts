import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { request } from '@/utils/api';
import {
  GaugeSchema,
  ListGaugesResponseSchema,
  OkResponseSchema,
  type Gauge,
  type CreateGaugeInput,
  type UpdateGaugeInput,
  type ListGaugesQuery,
  type ListGaugesResponse,
  type OkResponse,
} from '../schemas/gauges.schema';

const URL = {
  list: 'listGauges',
  get: 'getGauge',
  create: 'createGauge',
  update: 'updateGauge',
  remove: 'deleteGauge',
} as const;

export const QUERY_KEY = 'gauges';

export function useGaugesInfinite(query?: Omit<Partial<ListGaugesQuery>, 'page'>) {
  const pageSize = query?.pageSize ?? 20;
  return useInfiniteQuery<ListGaugesResponse, Error>({
    queryKey: [QUERY_KEY, 'infinite', query],
    queryFn: ({ pageParam }) => {
      const data: Record<string, unknown> = { page: pageParam, pageSize };
      if (query?.search) data.search = query.search;
      return request(URL.list, { data, schema: ListGaugesResponseSchema });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.isLastPage ? undefined : lastPage.pagination.page + 1,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useGauge(id?: string) {
  return useQuery<Gauge, Error>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => request(URL.get, { data: { id }, schema: GaugeSchema }),
    enabled: !!id,
  });
}

export function useCreateGauge() {
  return useAPIMutation<Gauge, CreateGaugeInput>({
    mutationFn: (data) => request(URL.create, { data, schema: GaugeSchema }),
    successMessage: 'Bitola cadastrada com sucesso',
    errorMessage: 'Falha ao cadastrar bitola',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useUpdateGauge() {
  return useAPIMutation<OkResponse, { id: string; data: Partial<UpdateGaugeInput> }>({
    mutationFn: (payload) => request(URL.update, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Bitola atualizada',
    errorMessage: 'Falha ao atualizar bitola',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useDeleteGauge() {
  return useAPIMutation<OkResponse, { id: string }>({
    mutationFn: (payload) => request(URL.remove, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Bitola removida',
    errorMessage: 'Falha ao remover bitola',
    invalidateQueryKey: [QUERY_KEY],
  });
}
