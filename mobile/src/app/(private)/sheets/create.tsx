import { useMemo } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateSheet } from '@/features/sheets/services/sheets.hooks';
import { CreateSheetSchema, type CreateSheetInput } from '@/features/sheets/schemas/sheets.schema';
import { useApplicatorsInfinite } from '@/features/applicators/services/applicators.hooks';
import { useGaugesInfinite } from '@/features/gauges/services/gauges.hooks';
import { useTerminalsInfinite } from '@/features/terminals/services/terminals.hooks';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { SelectInput } from '@/components/forms/select-input';
import { TextArea } from '@/components/forms/text-area';
import { Button } from '@/components/layout/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';

export default function CreateSheetScreen() {
  const form = useForm<CreateSheetInput>({
    resolver: zodResolver(CreateSheetSchema),
    defaultValues: {
      applicatorId: '',
      gaugeId: '',
      terminalId: '',
      cch: 0, cch_min: 0, cch_max: 0,
      cca: 0, cca_min: 0, cca_max: 0,
      cah: 0, cah_min: 0, cah_max: 0,
      caa: 0, caa_min: 0, caa_max: 0,
      traction: 0,
      observation: '',
    },
  });

  const createSheet = useCreateSheet();

  const { data: applicatorsData } = useApplicatorsInfinite({ pageSize: 100 });
  const { data: gaugesData } = useGaugesInfinite({ pageSize: 100 });
  const { data: terminalsData } = useTerminalsInfinite({ pageSize: 100 });

  const applicatorOptions = useMemo(() => {
    return applicatorsData?.pages.flatMap(p => p.items).map(a => ({ label: `${a.code} - ${a.name}`, value: a.id })) ?? [];
  }, [applicatorsData]);

  const gaugeOptions = useMemo(() => {
    return gaugesData?.pages.flatMap(p => p.items).map(g => ({ label: `${g.awg} (${g.mm2}mm²)`, value: g.id })) ?? [];
  }, [gaugesData]);

  const terminalOptions = useMemo(() => {
    return terminalsData?.pages.flatMap(p => p.items).map(t => ({ label: `${t.pn} - ${t.supplier}`, value: t.id })) ?? [];
  }, [terminalsData]);

  const onSubmit = form.handleSubmit((data) => {
    createSheet.mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  });

  const renderToleranceGroup = (label: string, fieldBase: 'cch' | 'cca' | 'cah' | 'caa') => (
    <Box className="bg-background-50 p-4 rounded-lg border border-outline-100">
      <Text className="font-bold text-typography-900 mb-3">{label}</Text>
      
      <Input
        control={form.control}
        name={fieldBase}
        label="Valor Nominal (mm)"
        placeholder="Ex: 1.25"
        keyboardType="numeric"
      />
      
      <HStack className="gap-4 mt-4">
        <View className="flex-1">
          <Input
            control={form.control}
            name={`${fieldBase}_min` as any}
            label="Mínimo (mm)"
            placeholder="Ex: 1.20"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Input
            control={form.control}
            name={`${fieldBase}_max` as any}
            label="Máximo (mm)"
            placeholder="Ex: 1.30"
            keyboardType="numeric"
          />
        </View>
      </HStack>
    </Box>
  );

  return (
    <ScreenLayout
      type="scroll"
      title="Nova Ficha"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      <VStack className="gap-6 bg-background-0 p-4 rounded-xl border border-outline-200">
        
        <Box>
          <Text className="font-bold text-typography-950 mb-4 text-lg">Especificações Básicas</Text>
          <VStack className="gap-4">
            <SelectInput
              control={form.control}
              name="applicatorId"
              label="Aplicador"
              options={applicatorOptions}
            />
            <SelectInput
              control={form.control}
              name="gaugeId"
              label="Bitola"
              options={gaugeOptions}
            />
            <SelectInput
              control={form.control}
              name="terminalId"
              label="Terminal"
              options={terminalOptions}
            />
          </VStack>
        </Box>

        <Divider className="my-2" />

        <Box>
          <Text className="font-bold text-typography-950 mb-4 text-lg">Parâmetros de Crimpagem</Text>
          <VStack className="gap-4">
            {renderToleranceGroup('Cota de Crimpagem do Condutor (CCH)', 'cch')}
            {renderToleranceGroup('Cota de Crimpagem do Isolante (CCA)', 'cca')}
            {renderToleranceGroup('Altura de Crimpagem do Condutor (CAH)', 'cah')}
            {renderToleranceGroup('Altura de Crimpagem do Isolante (CAA)', 'caa')}
          </VStack>
        </Box>

        <Divider className="my-2" />

        <Box>
          <Text className="font-bold text-typography-950 mb-4 text-lg">Testes e Observações</Text>
          <VStack className="gap-4">
            <Input
              control={form.control}
              name="traction"
              label="Tração Mínima (N)"
              placeholder="Ex: 150"
              keyboardType="numeric"
            />

            <TextArea
              control={form.control}
              name="observation"
              label="Observações Adicionais"
              placeholder="Instruções especiais de setup..."
              rounded="rounded-md"
            />
          </VStack>
        </Box>

        <Box className="mt-4 gap-3">
          <Button
            labelText="Salvar Ficha"
            isLoading={createSheet.isPending}
            onPress={onSubmit}
            buttonSize="xl"
          />
          <Button
            labelText="Cancelar"
            variant="outline"
            buttonSize="xl"
            onPress={() => router.back()}
            isDisabled={createSheet.isPending}
          />
        </Box>

      </VStack>
    </ScreenLayout>
  );
}
