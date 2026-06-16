import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useUser, useUpdateUser, useDeleteUser, useResetUserPassword } from '@/features/users/services/users.hooks';
import { UpdateUserSchema, type UpdateUserInput } from '@/features/users/schemas/users.schema';
import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/utils/hasPermission';
import { KnownClaims } from '@/constants/routes';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { SelectInput } from '@/components/forms/select-input';
import { Button } from '@/components/layout/button';
import { ConfirmDialog } from '@/components/layout/confirm_dialog';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';

export default function UpdateUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  
  const canUpdate = hasPermission(session?.user, [KnownClaims.update_users]);
  const canDelete = hasPermission(session?.user, [KnownClaims.delete_users]);
  const canResetPassword = hasPermission(session?.user, [KnownClaims.reset_user_password]);

  const { data: user, isLoading, isError, refetch } = useUser(id);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();

  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      name: '',
      role: 'operator',
      jobTitle: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        role: user.role,
        jobTitle: user.jobTitle,
        dateOfBirth: user.dateOfBirth,
        legacyId: user.legacyId,
      });
    }
  }, [user, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (!id) return;
    updateUser.mutate({ id, data }, {
      onSuccess: () => router.back(),
    });
  });

  const handleDelete = () => {
    if (!id) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => router.back(),
    });
  };

  const handleResetPassword = () => {
    if (!id) return;
    resetPassword.mutate({ id }, {
      onSuccess: (res) => {
        setGeneratedPassword(res.newPassword);
      },
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

  if (isError || !user) {
    return (
      <ScreenLayout type="scroll" title="Erro">
        <VStack className="items-center gap-4 py-20 px-6">
          <Text className="text-center text-typography-500">
            Não foi possível carregar os dados deste usuário.
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
        title="Detalhes do Usuário"
        subtitle={user.email}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
          <Input
            control={form.control}
            name="name"
            label="Nome Completo"
            isReadOnly={!canUpdate}
          />

          <Box>
            <Text size="sm" className="font-medium text-typography-900 mb-1">E-mail</Text>
            <View className="bg-background-50 border border-outline-200 rounded-md px-3 py-2.5 opacity-70">
              <Text className="text-typography-500">{user.email}</Text>
            </View>
            <Text size="xs" className="text-typography-400 mt-1">
              O e-mail não pode ser alterado após a criação.
            </Text>
          </Box>

          <SelectInput
            control={form.control}
            name="role"
            label="Perfil de Acesso"
            isDisabled={!canUpdate}
            options={[
              { label: 'Administrador', value: 'admin' },
              { label: 'Operador', value: 'operator' },
              { label: 'Consultor', value: 'consultant' },
            ]}
          />

          <Input
            control={form.control}
            name="jobTitle"
            label="Cargo"
            isReadOnly={!canUpdate}
          />

          <Input
            control={form.control}
            name="dateOfBirth"
            label="Data de Nascimento"
            isReadOnly={!canUpdate}
          />

          <Input
            control={form.control}
            name="legacyId"
            label="ID Sistema Legado (Opcional)"
            keyboardType="numeric"
            isReadOnly={!canUpdate}
          />

          <Box className="mt-4 gap-3">
            {canUpdate && (
              <Button
                labelText="Salvar Alterações"
                isLoading={updateUser.isPending}
                onPress={onSubmit}
                buttonSize="xl"
              />
            )}
            
            {canResetPassword && (
              <Button
                labelText="Resetar Senha"
                variant="outline"
                buttonSize="xl"
                onPress={handleResetPassword}
                isLoading={resetPassword.isPending}
              />
            )}
          </Box>

          {canDelete && (
            <>
              <Divider className="my-2" />
              <Button
                labelText="Excluir usuário"
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
        title="Excluir Usuário?"
        description="Esta ação desativa o login do colaborador e marca o registro como removido do sistema."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={deleteUser.isPending}
      />

      <AlertDialog
        isOpen={!!generatedPassword}
        onClose={() => {
          // Bloqueado até copiar
        }}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-4">
          <AlertDialogHeader>
            <Heading size="lg" className="text-typography-950 text-center">
              Senha Resetada
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-4 mb-6">
            <Text className="text-typography-500 text-center mb-4">
              A senha do colaborador foi resetada com sucesso. Anote a senha temporária abaixo para informá-lo.
            </Text>
            <Box className="bg-background-50 border border-outline-200 rounded-lg py-4 items-center">
              <Text className="font-bold text-2xl tracking-widest text-primary-600">
                {generatedPassword}
              </Text>
            </Box>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              labelText="Ok, copiei a senha"
              onPress={() => setGeneratedPassword(null)}
              className="w-full"
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
