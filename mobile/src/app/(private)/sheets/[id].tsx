import { useEffect, useState, useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSheet, useUpdateSheet, useDeleteSheet } from '@/features/sheets/services/sheets.hooks';
import { UpdateSheetSchema, type UpdateSheetInput } from '@/features/sheets/schemas/sheets.schema';
import { useApplicatorsInfinite } from '@/features/applicators/services/applicators.hooks';
import { useGaugesInfinite } from '@/features/gauges/services/gauges.hooks';
import { useTerminalsInfinite } from '@/features/terminals/services/terminals.hooks';
import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/utils/hasPermission';
import { KnownClaims } from '@/constants/routes';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/forms/input';
import { SelectInput } from '@/components/forms/select-input';
import { TextArea } from '@/components/forms/text-area';
import { Button } from '@/components/layout/button';
import { ConfirmDialog } from '@/components/layout/confirm_dialog';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';

export default function UpdateSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  
  const canUpdate = hasPermission(session?.user, [KnownClaims.update_sheets]);
  const canDelete = hasPermission(session?.user, [KnownClaims.delete_sheets]);

  const { data: sheet, isLoading, isError, refetch } = useSheet(id);
  const updateSheet = useUpdateSheet();
  const deleteSheet = useDeleteSheet();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  const form = useForm<UpdateSheetInput>({
    resolver: zodResolver(UpdateSheetSchema),
    defaultValues: {
      applicatorId: '', gaugeId: '', terminalId: '',
      cch: 0, cch_min: 0, cch_max: 0,
      cca: 0, cca_min: 0, cca_max: 0,
      cah: 0, cah_min: 0, cah_max: 0,
      caa: 0, caa_min: 0, caa_max: 0,
      traction: 0, observation: '',
    },
  });

  useEffect(() => {
    if (sheet) {
      form.reset({
        applicatorId: sheet.applicatorId,
        gaugeId: sheet.gaugeId,
        terminalId: sheet.terminalId,
        cch: sheet.cch, cch_min: sheet.cch_min, cch_max: sheet.cch_max,
        cca: sheet.cca, cca_min: sheet.cca_min, cca_max: sheet.cca_max,
        cah: sheet.cah, cah_min: sheet.cah_min, cah_max: sheet.cah_max,
        caa: sheet.caa, caa_min: sheet.caa_min, caa_max: sheet.caa_max,
        traction: sheet.traction,
        observation: sheet.observation ?? '',
      });
    }
  }, [sheet, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (!id) return;
    updateSheet.mutate({ id, data }, {
      onSuccess: () => router.back(),
    });
  });

  const handleDelete = () => {
    if (!id) return;
    deleteSheet.mutate({ id }, {
      onSuccess: () => router.back(),
    });
  };

  const renderToleranceGroup = (label: string, fieldBase: 'cch' | 'cca' | 'cah' | 'caa') => (
    <Box className="bg-background-50 p-4 rounded-lg border border-outline-100">
      <Text className="font-bold text-typography-900 mb-3">{label}</Text>
      
      <Input
        control={form.control}
        name={fieldBase}
        label="Valor Nominal (mm)"
        keyboardType="numeric"
        isReadOnly={!canUpdate}
      />
      
      <HStack className="gap-4 mt-4">
        <View className="flex-1">
          <Input
            control={form.control}
            name={`${fieldBase}_min` as any}
            label="Mínimo (mm)"
            keyboardType="numeric"
            isReadOnly={!canUpdate}
          />
        </View>
        <View className="flex-1">
          <Input
            control={form.control}
            name={`${fieldBase}_max` as any}
            label="Máximo (mm)"
            keyboardType="numeric"
            isReadOnly={!canUpdate}
          />
        </View>
      </HStack>
    </Box>
  );

  if (isLoading) {
    return (
      <ScreenLayout type="scroll" title="Carregando...">
        <Box className="flex-1 items-center justify-center py-20">
          <Spinner />
        </Box>
      </ScreenLayout>
    );
  }

  if (isError || !sheet) {
    return (
      <ScreenLayout type="scroll" title="Erro">
        <VStack className="items-center gap-4 py-20 px-6">
          <Text className="text-center text-typography-500">
            Não foi possível carregar os dados desta ficha.
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
        title="Detalhes da Ficha"
        subtitle={`ID: ${sheet.id.slice(0, 8).toUpperCase()}`}
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
                isDisabled={!canUpdate}
              />
              <SelectInput
                control={form.control}
                name="gaugeId"
                label="Bitola"
                options={gaugeOptions}
                isDisabled={!canUpdate}
              />
              <SelectInput
                control={form.control}
                name="terminalId"
                label="Terminal"
                options={terminalOptions}
                isDisabled={!canUpdate}
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
                keyboardType="numeric"
                isReadOnly={!canUpdate}
              />

              <TextArea
                control={form.control}
                name="observation"
                label="Observações Adicionais"
                readonly={!canUpdate}
                rounded="rounded-md"
              />
            </VStack>
          </Box>

          {canUpdate && (
            <Box className="mt-4">
              <Button
                labelText="Salvar Alterações"
                isLoading={updateSheet.isPending}
                onPress={onSubmit}
                buttonSize="xl"
              />
            </Box>
          )}

          {canDelete && (
            <>
              <Divider className="my-2" />
              <Button
                labelText="Excluir Ficha"
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
        title="Excluir Ficha?"
        description="Tem certeza que deseja excluir esta ficha de regulagem? Os registros de coleta associados a ela poderão ficar inconsistentes."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={deleteSheet.isPending}
      />
    </>
  );
}
