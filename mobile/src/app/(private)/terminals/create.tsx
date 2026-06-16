import { View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateTerminal } from '@/features/terminals/services/terminals.hooks';
import { CreateTerminalSchema, type CreateTerminalInput } from '@/features/terminals/schemas/terminals.schema';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { SelectInput } from '@/components/forms/select-input';
import { Button } from '@/components/layout/button';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';

export default function CreateTerminalScreen() {
  const form = useForm<CreateTerminalInput>({
    resolver: zodResolver(CreateTerminalSchema),
    defaultValues: {
      pn: '',
      supplier: '',
      type: 'pino',
    },
  });

  const createTerminal = useCreateTerminal();

  const onSubmit = form.handleSubmit((data) => {
    createTerminal.mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  });

  return (
    <ScreenLayout
      type="scroll"
      title="Novo Terminal"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
        <Input
          control={form.control}
          name="pn"
          label="Part Number (PN)"
          placeholder="Ex: 284048-1"
          autoCapitalize="characters"
        />

        <Input
          control={form.control}
          name="supplier"
          label="Fornecedor"
          placeholder="Ex: TE Connectivity"
        />

        <SelectInput
          control={form.control}
          name="type"
          label="Tipo do Terminal"
          options={[
            { label: 'Pino', value: 'pino' },
            { label: 'Fêmea', value: 'femea' },
            { label: 'Olhal', value: 'olhal' },
            { label: 'Pino Macho', value: 'pino_macho' },
            { label: 'Faston', value: 'faston' },
            { label: 'Outro', value: 'outro' },
          ]}
        />

        <Box className="mt-4 gap-3">
          <Button
            labelText="Cadastrar Terminal"
            isLoading={createTerminal.isPending}
            onPress={onSubmit}
            buttonSize="xl"
          />
          <Button
            labelText="Cancelar"
            variant="outline"
            buttonSize="xl"
            onPress={() => router.back()}
            isDisabled={createTerminal.isPending}
          />
        </Box>
      </VStack>
    </ScreenLayout>
  );
}
