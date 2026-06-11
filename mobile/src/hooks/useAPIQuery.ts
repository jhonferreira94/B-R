import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import type { ZodType, ZodTypeDef } from 'zod';
import { request } from '@/utils/api';

interface UseAPIQueryOptions<T>
  extends Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryFn'> {
  url: string;
  params?: Record<string, unknown>;
  schema?: ZodType<T, ZodTypeDef, unknown>;
}

export function useAPIQuery<T>(opts: UseAPIQueryOptions<T>) {
  const { url, params, schema, ...rest } = opts;
  return useQuery<T, Error, T, QueryKey>({
    ...rest,
    queryFn: () => request<T>(url, { data: params, schema }),
  });
}
