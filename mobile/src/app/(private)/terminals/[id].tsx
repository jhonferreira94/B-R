import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTerminal, useUpdateTerminal, useDeleteTerminal } from '@/features/terminals/services/terminals.hooks';
import { UpdateTerminalSchema, type UpdateTerminalInput } from '@/features/terminals/schemas/terminals.schema';
import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/utils/hasPermission';
import { KnownClaims } from '@/constants/routes';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { SelectInput } from '@/components/forms/select-input';
import { Button } from '@/components/layout/button';
import { ConfirmDialog } from '@/components/layout/confirm_dialog';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';

export default function UpdateTerminalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  
  const canUpdate = hasPermission(session?.user, [KnownClaims.update_terminals]);
  const canDelete = hasPermission(session?.user, [KnownClaims.delete_terminals]);

  const { data: terminal, isLoading, isError, refetch } = useTerminal(id);
  const updateTerminal = useUpdateTerminal();
  const deleteTerminal = useDeleteTerminal();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const form = useForm<UpdateTerminalInput>({
    resolver: zodResolver(UpdateTerminalSchema),
    defaultValues: {
      pn: '',
      supplier: '',
      type: 'pino',
    },
  });

  useEffect(() => {
    if (terminal) {
      form.reset({
        pn: terminal.pn,
        supplier: terminal.supplier,
        type: terminal.type,
      });
    }
  }, [terminal, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (!id) return;
    updateTerminal.mutate({ id, data }, {
      onSuccess: () => router.back(),
    });
  });

  const handleDelete = () => {
    if (!id) return;
    deleteTerminal.mutate({ id }, {
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

  if (isError || !terminal) {
    return (
      <ScreenLayout type="scroll" title="Erro">
        <VStack className="items-center gap-4 py-20 px-6">
          <Text className="text-center text-typography-500">
            Não foi possível carregar os dados deste terminal.
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
        title="Detalhes do Terminal"
        subtitle={`Cadastrado: ${terminal.createdAt ? new Date(terminal.createdAt).toLocaleDateString() : 'N/A'}`}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
          <Input
            control={form.control}
            name="pn"
            label="Part Number (PN)"
            isReadOnly={!canUpdate}
            autoCapitalize="characters"
          />

          <Input
            control={form.control}
            name="supplier"
            label="Fornecedor"
            isReadOnly={!canUpdate}
          />

          <SelectInput
            control={form.control}
            name="type"
            label="Tipo do Terminal"
            isDisabled={!canUpdate}
            options={[
              { label: 'Pino', value: 'pino' },
              { label: 'Fêmea', value: 'femea' },
              { label: 'Olhal', value: 'olhal' },
              { label: 'Pino Macho', value: 'pino_macho' },
              { label: 'Faston', value: 'faston' },
              { label: 'Outro', value: 'outro' },
            ]}
          />

          {canUpdate && (
            <Box className="mt-4">
              <Button
                labelText="Salvar Alterações"
                isLoading={updateTerminal.isPending}
                onPress={onSubmit}
                buttonSize="xl"
              />
            </Box>
          )}

          {canDelete && (
            <>
              <Divider className="my-2" />
              <Button
                labelText="Excluir Terminal"
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
        title="Excluir Terminal?"
        description={`Tem certeza que deseja excluir o terminal PN ${terminal.pn}? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={deleteTerminal.isPending}
      />
    </>
  );
}
