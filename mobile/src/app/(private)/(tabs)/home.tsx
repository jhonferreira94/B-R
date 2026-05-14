import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClientsInfinite, useSeedClients } from '@/features/clients';
import { useAuth } from '@/providers/AuthProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchInput } from '@/components/forms/search-input';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/layout/button';
import { NAVIGATION_BAR_HEIGHT } from '@/components/navigation/navigation-bar';
import type { Client } from '@/features/clients/schemas/clients.schema';

export default function HomeScreen() {
  const { session } = useAuth();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useClientsInfinite({ search: debouncedSearch || undefined, pageSize: 10 });

  const seedClients = useSeedClients();

  const items: Client[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const total = data?.pages[0]?.pagination.total ?? 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background-0">
      <VStack className="px-4 pt-2 pb-3 gap-3">
        <HStack className="items-center justify-between">
          <VStack>
            <Text size="sm" className="text-typography-500">
              Olá,
            </Text>
            <Heading size="xl" className="text-typography-950">
              {session?.user.name?.split(' ')[0] ?? 'Usuário'}
            </Heading>
          </VStack>
          <Text size="sm" className="text-typography-500">
            {total} {total === 1 ? 'cliente' : 'clientes'}
          </Text>
        </HStack>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nome, e-mail ou documento"
        />
      </VStack>

      {isLoading ? (
        <Box className="flex-1 items-center justify-center">
          <Spinner />
        </Box>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: NAVIGATION_BAR_HEIGHT + 24, gap: 8 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <VStack className="rounded-lg border border-outline-200 bg-background-0 p-3">
              <Text className="font-semibold text-typography-950">{item.name}</Text>
              <Text size="sm" className="text-typography-500 mt-1">
                {item.email}
              </Text>
              <Text size="xs" className="text-typography-400 mt-1">
                {item.document}
              </Text>
            </VStack>
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Box className="py-4 items-center">
                <ActivityIndicator />
              </Box>
            ) : null
          }
          ListEmptyComponent={
            isError ? (
              <VStack className="items-center gap-3 mt-10 px-6">
                <Text className="text-typography-500 text-center">
                  Não foi possível carregar os clientes.
                </Text>
                <Button
                  labelText="Tentar novamente"
                  buttonSize="md"
                  buttonTextSize="md"
                  onPress={() => refetch()}
                />
              </VStack>
            ) : (
              <VStack className="items-center gap-3 mt-10 px-6">
                <Text className="text-typography-500 text-center">
                  {debouncedSearch
                    ? 'Nenhum cliente encontrado para essa busca.'
                    : 'Nenhum cliente cadastrado ainda.'}
                </Text>
                {!debouncedSearch && (
                  <Button
                    labelText="Gerar clientes de exemplo"
                    buttonSize="md"
                    buttonTextSize="md"
                    isLoading={seedClients.isPending}
                    isDisabled={seedClients.isPending}
                    onPress={() => seedClients.mutate()}
                  />
                )}
              </VStack>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
