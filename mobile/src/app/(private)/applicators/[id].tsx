import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useApplicator, useUpdateApplicator, useDeleteApplicator } from '@/features/applicators/services/applicators.hooks';
import { UpdateApplicatorSchema, type UpdateApplicatorInput } from '@/features/applicators/schemas/applicators.schema';
import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/utils/hasPermission';
import { KnownClaims } from '@/constants/routes';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { TextArea } from '@/components/forms/text-area';
import { Button } from '@/components/layout/button';
import { ConfirmDialog } from '@/components/layout/confirm_dialog';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';

export default function UpdateApplicatorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  
  const canUpdate = hasPermission(session?.user, [KnownClaims.update_applicators]);
  const canDelete = hasPermission(session?.user, [KnownClaims.delete_applicators]);

  const { data: applicator, isLoading, isError, refetch } = useApplicator(id);
  const updateApplicator = useUpdateApplicator();
  const deleteApplicator = useDeleteApplicator();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const form = useForm<UpdateApplicatorInput>({
    resolver: zodResolver(UpdateApplicatorSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      maintenanceCycles: 0,
    },
  });

  useEffect(() => {
    if (applicator) {
      form.reset({
        code: applicator.code,
        name: applicator.name,
        description: applicator.description ?? '',
        maintenanceCycles: applicator.maintenanceCycles,
      });
    }
  }, [applicator, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (!id) return;
    updateApplicator.mutate({ id, data }, {
      onSuccess: () => router.back(),
    });
  });

  const handleDelete = () => {
    if (!id) return;
    deleteApplicator.mutate({ id }, {
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

  if (isError || !applicator) {
    return (
      <ScreenLayout type="scroll" title="Erro">
        <VStack className="items-center gap-4 py-20 px-6">
          <Text className="text-center text-typography-500">
            Não foi possível carregar os dados deste aplicador.
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
        title="Detalhes do Aplicador"
        subtitle={`Cadastrado: ${applicator.createdAt ? new Date(applicator.createdAt).toLocaleDateString() : 'N/A'}`}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
          <Input
            control={form.control}
            name="code"
            label="Código do Aplicador"
            isReadOnly={!canUpdate}
            autoCapitalize="characters"
          />

          <Input
            control={form.control}
            name="name"
            label="Nome/Modelo"
            isReadOnly={!canUpdate}
          />

          <Input
            control={form.control}
            name="maintenanceCycles"
            label="Ciclos de Manutenção (Vida Útil)"
            keyboardType="numeric"
            isReadOnly={!canUpdate}
          />

          <TextArea
            control={form.control}
            name="description"
            label="Descrição / Notas (Opcional)"
            readonly={!canUpdate}
            rounded="rounded-md"
          />

          {canUpdate && (
            <Box className="mt-4">
              <Button
                labelText="Salvar Alterações"
                isLoading={updateApplicator.isPending}
                onPress={onSubmit}
                buttonSize="xl"
              />
            </Box>
          )}

          {canDelete && (
            <>
              <Divider className="my-2" />
              <Button
                labelText="Excluir Aplicador"
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
        title="Excluir Aplicador?"
        description={`Tem certeza que deseja excluir o aplicador ${applicator.code}? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={deleteApplicator.isPending}
      />
    </>
  );
}
