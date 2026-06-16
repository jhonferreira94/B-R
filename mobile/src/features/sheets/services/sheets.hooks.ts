import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { request } from '@/utils/api';
import {
  SheetSchema,
  ListSheetsResponseSchema,
  OkResponseSchema,
  type Sheet,
  type CreateSheetInput,
  type UpdateSheetInput,
  type ListSheetsQuery,
  type ListSheetsResponse,
  type OkResponse,
} from '../schemas/sheets.schema';

const URL = {
  list: 'listSheets',
  get: 'getSheet',
  create: 'createSheet',
  update: 'updateSheet',
  remove: 'deleteSheet',
} as const;

export const QUERY_KEY = 'sheets';

export function useSheetsInfinite(query?: Omit<Partial<ListSheetsQuery>, 'page'>) {
  const pageSize = query?.pageSize ?? 20;
  return useInfiniteQuery<ListSheetsResponse, Error>({
    queryKey: [QUERY_KEY, 'infinite', query],
    queryFn: ({ pageParam }) => {
      const data: Record<string, unknown> = { page: pageParam, pageSize };
      if (query?.search) data.search = query.search;
      return request(URL.list, { data, schema: ListSheetsResponseSchema });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.isLastPage ? undefined : lastPage.pagination.page + 1,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useSheet(id?: string) {
  return useQuery<Sheet, Error>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => request(URL.get, { data: { id }, schema: SheetSchema }),
    enabled: !!id,
  });
}

export function useCreateSheet() {
  return useAPIMutation<Sheet, CreateSheetInput>({
    mutationFn: (data) => request(URL.create, { data, schema: SheetSchema }),
    successMessage: 'Ficha de regulagem criada com sucesso',
    errorMessage: 'Falha ao criar ficha de regulagem',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useUpdateSheet() {
  return useAPIMutation<OkResponse, { id: string; data: Partial<UpdateSheetInput> }>({
    mutationFn: (payload) => request(URL.update, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Ficha de regulagem atualizada',
    errorMessage: 'Falha ao atualizar ficha',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useDeleteSheet() {
  return useAPIMutation<OkResponse, { id: string }>({
    mutationFn: (payload) => request(URL.remove, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Ficha de regulagem removida',
    errorMessage: 'Falha ao remover ficha',
    invalidateQueryKey: [QUERY_KEY],
  });
}
