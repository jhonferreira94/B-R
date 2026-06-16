import { View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateGauge } from '@/features/gauges/services/gauges.hooks';
import { CreateGaugeSchema, type CreateGaugeInput } from '@/features/gauges/schemas/gauges.schema';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/layout/button';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';

export default function CreateGaugeScreen() {
  const form = useForm<CreateGaugeInput>({
    resolver: zodResolver(CreateGaugeSchema),
    defaultValues: {
      awg: '',
      mm2: 0,
    },
  });

  const createGauge = useCreateGauge();

  const onSubmit = form.handleSubmit((data) => {
    createGauge.mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  });

  return (
    <ScreenLayout
      type="scroll"
      title="Nova Bitola"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
        <Input
          control={form.control}
          name="awg"
          label="Bitola (AWG)"
          placeholder="Ex: 18 AWG"
        />

        <Input
          control={form.control}
          name="mm2"
          label="Seção Transversal (mm²)"
          placeholder="Ex: 0.82"
          keyboardType="numeric"
        />

        <Box className="mt-4 gap-3">
          <Button
            labelText="Cadastrar Bitola"
            isLoading={createGauge.isPending}
            onPress={onSubmit}
            buttonSize="xl"
          />
          <Button
            labelText="Cancelar"
            variant="outline"
            buttonSize="xl"
            onPress={() => router.back()}
            isDisabled={createGauge.isPending}
          />
        </Box>
      </VStack>
    </ScreenLayout>
  );
}
