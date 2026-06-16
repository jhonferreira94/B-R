import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useGauge, useUpdateGauge, useDeleteGauge } from '@/features/gauges/services/gauges.hooks';
import { UpdateGaugeSchema, type UpdateGaugeInput } from '@/features/gauges/schemas/gauges.schema';
import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/utils/hasPermission';
import { KnownClaims } from '@/constants/routes';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/layout/button';
import { ConfirmDialog } from '@/components/layout/confirm_dialog';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';

export default function UpdateGaugeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  
  const canUpdate = hasPermission(session?.user, [KnownClaims.update_gauges]);
  const canDelete = hasPermission(session?.user, [KnownClaims.delete_gauges]);

  const { data: gauge, isLoading, isError, refetch } = useGauge(id);
  const updateGauge = useUpdateGauge();
  const deleteGauge = useDeleteGauge();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const form = useForm<UpdateGaugeInput>({
    resolver: zodResolver(UpdateGaugeSchema),
    defaultValues: {
      awg: '',
      mm2: 0,
    },
  });

  useEffect(() => {
    if (gauge) {
      form.reset({
        awg: gauge.awg,
        mm2: gauge.mm2,
      });
    }
  }, [gauge, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (!id) return;
    updateGauge.mutate({ id, data }, {
      onSuccess: () => router.back(),
    });
  });

  const handleDelete = () => {
    if (!id) return;
    deleteGauge.mutate({ id }, {
      onSuccess: () => router.back(),
    });
  };

  if (isLoading) {
    return (
      <ScreenLayout type="scroll" title="Carregando...">
        <Box className="flex-1 items-center justify-center py-20">
          <Spinner />
        </Box>
      </ScreenLayout>
    );
  }

  if (isError || !gauge) {
    return (
      <ScreenLayout type="scroll" title="Erro">
        <VStack className="items-center gap-4 py-20 px-6">
          <Text className="text-center text-typography-500">
            Não foi possível carregar os dados desta bitola.
          </Text>
          <Button labelText="Tentar Novamente" onPress={() => refetch()} />
        </VStack>
      </ScreenLayout>
    );
  }

  return (
    <>
      <ScreenLayout
        type="scroll"
        title="Detalhes da Bitola"
        subtitle={`Cadastrada: ${gauge.createdAt ? new Date(gauge.createdAt).toLocaleDateString() : 'N/A'}`}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
          <Input
            control={form.control}
            name="awg"
            label="Bitola (AWG)"
            isReadOnly={!canUpdate}
          />

          <Input
            control={form.control}
            name="mm2"
            label="Seção Transversal (mm²)"
            keyboardType="numeric"
            isReadOnly={!canUpdate}
          />

          {canUpdate && (
            <Box className="mt-4">
              <Button
                labelText="Salvar Alterações"
                isLoading={updateGauge.isPending}
                onPress={onSubmit}
                buttonSize="xl"
              />
            </Box>
          )}

          {canDelete && (
            <>
              <Divider className="my-2" />
              <Button
                labelText="Excluir Bitola"
                variant="link"
                classNameButtonText="text-error-600 font-semibold"
                onPress={() => setIsDeleteOpen(true)}
              />
            </>
          )}
        </VStack>
      </ScreenLayout>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Bitola?"
        description={`Tem certeza que deseja excluir a bitola ${gauge.awg}? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={deleteGauge.isPending}
      />
    </>
  );
}
