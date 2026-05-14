import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { request } from '@/utils/api';

interface UseAPIQueryOptions<T>
  extends Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryFn'> {
  url: string;
  method?: 'GET' | 'POST';
  params?: Record<string, unknown>;
}

export function useAPIQuery<T>(opts: UseAPIQueryOptions<T>) {
  const { url, method = 'POST', params, ...rest } = opts;
  return useQuery<T, Error, T, QueryKey>({
    ...rest,
    queryFn: () => request<T>(url, method, { data: params }),
  });
}
