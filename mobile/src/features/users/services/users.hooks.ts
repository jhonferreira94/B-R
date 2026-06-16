import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { request } from '@/utils/api';
import {
  UserSchema,
  ListUsersResponseSchema,
  OkResponseSchema,
  ResetPasswordResponseSchema,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
  type ListUsersQuery,
  type ListUsersResponse,
  type OkResponse,
  type ResetPasswordResponse,
} from '../schemas/users.schema';

const URL = {
  list: 'listUsers',
  get: 'getUser',
  create: 'createUser',
  update: 'updateUser',
  remove: 'deleteUser',
  resetPassword: 'resetUserPassword',
} as const;

export const QUERY_KEY = 'users';

export function useUsersInfinite(query?: Omit<Partial<ListUsersQuery>, 'page'>) {
  const pageSize = query?.pageSize ?? 20;
  return useInfiniteQuery<ListUsersResponse, Error>({
    queryKey: [QUERY_KEY, 'infinite', query],
    queryFn: ({ pageParam }) => {
      const data: Record<string, unknown> = { page: pageParam, pageSize };
      if (query?.search) data.search = query.search;
      if (query?.role) data.role = query.role;
      return request(URL.list, { data, schema: ListUsersResponseSchema });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.isLastPage ? undefined : lastPage.pagination.page + 1,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useUser(id?: string) {
  return useQuery<User, Error>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => request(URL.get, { data: { id }, schema: UserSchema }),
    enabled: !!id,
  });
}

export function useCreateUser() {
  return useAPIMutation<ResetPasswordResponse, CreateUserInput>({
    mutationFn: (data) => request(URL.create, { data, schema: ResetPasswordResponseSchema }),
    successMessage: 'Usuário criado com sucesso',
    errorMessage: 'Falha ao criar usuário',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useUpdateUser() {
  return useAPIMutation<OkResponse, { id: string; data: Partial<UpdateUserInput> }>({
    mutationFn: (payload) => request(URL.update, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Usuário atualizado',
    errorMessage: 'Falha ao atualizar usuário',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useDeleteUser() {
  return useAPIMutation<OkResponse, { id: string }>({
    mutationFn: (payload) => request(URL.remove, { data: payload, schema: OkResponseSchema }),
    successMessage: 'Usuário removido',
    errorMessage: 'Falha ao remover usuário',
    invalidateQueryKey: [QUERY_KEY],
  });
}

export function useResetUserPassword() {
  return useAPIMutation<ResetPasswordResponse, { id: string }>({
    mutationFn: (payload) => request(URL.resetPassword, { data: payload, schema: ResetPasswordResponseSchema }),
    successMessage: 'Senha gerada com sucesso',
    errorMessage: 'Falha ao gerar nova senha',
  });
}
