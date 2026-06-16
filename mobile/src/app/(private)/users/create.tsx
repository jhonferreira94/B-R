import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateUser } from '@/features/users/services/users.hooks';
import { CreateUserSchema, type CreateUserInput } from '@/features/users/schemas/users.schema';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { SelectInput } from '@/components/forms/select-input';
import { Button } from '@/components/layout/button';
import { VStack } from '@/components/ui/vstack';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';

export default function CreateUserScreen() {
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'operator',
      jobTitle: '',
      dateOfBirth: '',
    },
  });

  const createUser = useCreateUser();

  const onSubmit = form.handleSubmit((data) => {
    createUser.mutate(data, {
      onSuccess: (res) => {
        setGeneratedPassword(res.newPassword);
      },
    });
  });

  return (
    <>
      <ScreenLayout
        type="scroll"
        title="Novo Usuário"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
          <Input
            control={form.control}
            name="name"
            label="Nome Completo"
            placeholder="Ex: João da Silva"
          />

          <Input
            control={form.control}
            name="email"
            label="E-mail"
            placeholder="joao@brchicotes.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <SelectInput
            control={form.control}
            name="role"
            label="Perfil de Acesso"
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
            placeholder="Ex: Engenheiro de Processos"
          />

          <Input
            control={form.control}
            name="dateOfBirth"
            label="Data de Nascimento"
            placeholder="YYYY-MM-DD" // In a real app we'd use a date picker or mask
          />

          <Input
            control={form.control}
            name="legacyId"
            label="ID Sistema Legado (Opcional)"
            placeholder="Ex: 12345"
            keyboardType="numeric"
          />

          <Box className="mt-4 gap-3">
            <Button
              labelText="Criar Usuário"
              isLoading={createUser.isPending}
              onPress={onSubmit}
              buttonSize="xl"
            />
            <Button
              labelText="Cancelar"
              variant="outline"
              buttonSize="xl"
              onPress={() => router.back()}
              isDisabled={createUser.isPending}
            />
          </Box>
        </VStack>
      </ScreenLayout>

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
              Senha Gerada
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-4 mb-6">
            <Text className="text-typography-500 text-center mb-4">
              O usuário foi criado. Anote a senha temporária abaixo. No primeiro login, será exigida a troca obrigatória.
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
              onPress={() => {
                setGeneratedPassword(null);
                router.back();
              }}
              className="w-full"
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
