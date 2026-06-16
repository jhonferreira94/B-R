import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';

import { useSheetsInfinite } from '@/features/sheets/services/sheets.hooks';
import type { Sheet } from '@/features/sheets/schemas/sheets.schema';
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

export default function SheetsListScreen() {
  const { session } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const canCreate = hasPermission(session?.user, [KnownClaims.create_sheets]);

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSheetsInfinite({ search: debouncedSearch || undefined, pageSize: 20 });

  const items: Sheet[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const total = data?.pages[0]?.pagination.total ?? 0;

  const headerRight = canCreate ? (
    <Button
      variant="outline"
      buttonSize="sm"
      className="rounded-full border-primary-500 bg-transparent px-3 py-1"
      onPress={() => router.push('/sheets/create')}
    >
      <HStack className="items-center gap-1">
        <Plus size={16} color="#0284C7" />
        <Text size="sm" className="text-primary-600 font-semibold">
          Nova
        </Text>
      </HStack>
    </Button>
  ) : undefined;

  return (
    <ScreenListLayout<Sheet>
      title="Fichas de Regulagem"
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
            placeholder="Buscar por aplicador, bitola ou terminal"
          />
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/sheets/${item.id}`)}
          className="rounded-lg border border-outline-200 bg-background-0 p-4 shadow-sm shadow-background-900/5 flex-row items-center justify-between"
        >
          <VStack className="flex-1">
            <HStack className="items-center justify-between mb-1">
              <Text className="font-bold text-typography-950 text-base">
                {item.applicator?.code || 'Aplicador Desconhecido'}
              </Text>
              <View className="bg-primary-50 px-2 py-0.5 rounded-sm">
                <Text size="xs" className="text-primary-600 font-semibold">
                  {item.gauge?.awg || 'AWG Desconhecido'}
                </Text>
              </View>
            </HStack>
            
            <Text size="sm" className="text-typography-600 font-medium">
              Terminal: {item.terminal?.pn || 'Desconhecido'}
            </Text>
            
            <HStack className="items-center gap-4 mt-3">
              <Text size="xs" className="text-typography-500">
                CCH: <Text size="xs" className="font-bold text-typography-900">{item.cch} mm</Text>
              </Text>
              <Text size="xs" className="text-typography-500">
                CCA: <Text size="xs" className="font-bold text-typography-900">{item.cca} mm</Text>
              </Text>
              <Text size="xs" className="text-typography-500">
                Tração: <Text size="xs" className="font-bold text-typography-900">{item.traction}N</Text>
              </Text>
            </HStack>
          </VStack>
          <ChevronRight size={18} color="#94A3B8" className="ml-3" />
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
              Não foi possível carregar as fichas de regulagem.
            </Text>
            <Button labelText="Tentar novamente" buttonSize="md" onPress={() => refetch()} />
          </VStack>
        ) : (
          <VStack className="items-center gap-3 mt-10 px-6">
            <Text className="text-typography-500 text-center">
              {debouncedSearch
                ? 'Nenhuma ficha encontrada para essa busca.'
                : 'Nenhuma ficha cadastrada ainda.'}
            </Text>
          </VStack>
        )
      }
    />
  );
}
