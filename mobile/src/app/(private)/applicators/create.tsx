import { View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateApplicator } from '@/features/applicators/services/applicators.hooks';
import { CreateApplicatorSchema, type CreateApplicatorInput } from '@/features/applicators/schemas/applicators.schema';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { TextArea } from '@/components/forms/text-area';
import { Button } from '@/components/layout/button';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';

export default function CreateApplicatorScreen() {
  const form = useForm<CreateApplicatorInput>({
    resolver: zodResolver(CreateApplicatorSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      maintenanceCycles: 10000, // Valor padrão comum para ferramentas de precisão
    },
  });

  const createApplicator = useCreateApplicator();

  const onSubmit = form.handleSubmit((data) => {
    createApplicator.mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  });

  return (
    <ScreenLayout
      type="scroll"
      title="Novo Aplicador"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
        <Input
          control={form.control}
          name="code"
          label="Código do Aplicador"
          placeholder="Ex: AP-001"
          autoCapitalize="characters"
        />

        <Input
          control={form.control}
          name="name"
          label="Nome/Modelo"
          placeholder="Ex: Aplicador Mini-Mac"
        />

        <Input
          control={form.control}
          name="maintenanceCycles"
          label="Ciclos de Manutenção (Vida Útil)"
          placeholder="Ex: 10000"
          keyboardType="numeric"
        />

        <TextArea
          control={form.control}
          name="description"
          label="Descrição / Notas (Opcional)"
          placeholder="Descreva particularidades mecânicas, fornecedor, etc."
          rounded="rounded-md"
        />

        <Box className="mt-4 gap-3">
          <Button
            labelText="Cadastrar Aplicador"
            isLoading={createApplicator.isPending}
            onPress={onSubmit}
            buttonSize="xl"
          />
          <Button
            labelText="Cancelar"
            variant="outline"
            buttonSize="xl"
            onPress={() => router.back()}
            isDisabled={createApplicator.isPending}
          />
        </Box>
      </VStack>
    </ScreenLayout>
  );
}
