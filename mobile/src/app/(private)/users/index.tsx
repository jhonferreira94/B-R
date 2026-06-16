import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';

import { useUsersInfinite } from '@/features/users/services/users.hooks';
import type { User } from '@/features/users/schemas/users.schema';
import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/utils/hasPermission';
import { KnownClaims } from '@/constants/routes';
import { useDebounce } from '@/hooks/useDebounce';

import { ScreenListLayout } from '@/components/layout/screen-list-layout';
import { SearchInput } from '@/components/forms/search-input';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/layout/button';

const roleMap: Record<User['role'], string> = {
  admin: 'Administrador',
  operator: 'Operador',
  consultant: 'Consultor',
};

export default function UsersListScreen() {
  const { session } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const canCreate = hasPermission(session?.user, [KnownClaims.create_users]);

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersInfinite({ search: debouncedSearch || undefined, pageSize: 20 });

  const items: User[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const total = data?.pages[0]?.pagination.total ?? 0;

  const headerRight = canCreate ? (
    <Button
      variant="outline"
      buttonSize="sm"
      className="rounded-full border-primary-500 bg-transparent px-3 py-1"
      onPress={() => router.push('/users/create')}
    >
      <HStack className="items-center gap-1">
        <Plus size={16} color="#0284C7" />
        <Text size="sm" className="text-primary-600 font-semibold">
          Novo
        </Text>
      </HStack>
    </Button>
  ) : undefined;

  return (
    <ScreenListLayout<User>
      title="Usuários"
      subtitle={`${total} ${total === 1 ? 'registro' : 'registros'}`}
      headerRight={headerRight}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View className="mb-4">
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou e-mail"
          />
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/users/${item.id}`)}
          className="rounded-lg border border-outline-200 bg-background-0 p-4 shadow-sm shadow-background-900/5"
        >
          <HStack className="items-center justify-between mb-2">
            <Text className="font-bold text-typography-950 text-base">{item.name}</Text>
            <View
              className={`px-2 py-0.5 rounded-full ${
                item.isActive ? 'bg-success-100' : 'bg-outline-100'
              }`}
            >
              <Text size="xs" className={item.isActive ? 'text-success-800' : 'text-typography-500'}>
                {item.isActive ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </HStack>
          
          <Text size="sm" className="text-typography-600 mb-2">
            {item.email}
          </Text>

          <HStack className="items-center justify-between">
            <Text size="xs" className="text-typography-500 font-medium uppercase tracking-wider">
              {roleMap[item.role]} • {item.jobTitle}
            </Text>
            <ChevronRight size={18} color="#94A3B8" />
          </HStack>
        </TouchableOpacity>
      )}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Box className="py-4 items-center">
            <ActivityIndicator />
          </Box>
        ) : null
      }
      ListEmptyComponent={
        isLoading ? (
          <Box className="flex-1 items-center justify-center py-20">
            <Spinner />
          </Box>
        ) : isError ? (
          <VStack className="items-center gap-3 mt-10 px-6">
            <Text className="text-typography-500 text-center">
              Não foi possível carregar os usuários.
            </Text>
            <Button labelText="Tentar novamente" buttonSize="md" onPress={() => refetch()} />
          </VStack>
        ) : (
          <VStack className="items-center gap-3 mt-10 px-6">
            <Text className="text-typography-500 text-center">
              {debouncedSearch
                ? 'Nenhum usuário encontrado para essa busca.'
                : 'Nenhum usuário cadastrado ainda.'}
            </Text>
          </VStack>
        )
      }
    />
  );
}
