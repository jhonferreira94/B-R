import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/utils/hasPermission';
import { KnownClaims, privateRoutes } from '@/constants/routes';

import { Text } from '@/components/ui/text';
import { ScreenLayout } from '@/components/layout/screen-layout';

export default function HomeScreen() {
  const { session } = useAuth();
  const user = session?.user;

  const canListUsers = hasPermission(user, [KnownClaims.list_users]);
  const canListApplicators = hasPermission(user, [KnownClaims.list_applicators]);
  const canListGauges = hasPermission(user, [KnownClaims.list_gauges]);
  const canListTerminals = hasPermission(user, [KnownClaims.list_terminals]);
  const canListSheets = hasPermission(user, [KnownClaims.list_sheets]);
  const canListStaplings = hasPermission(user, [KnownClaims.list_staplings]);

  const hasAnyPermission =
    canListUsers ||
    canListApplicators ||
    canListGauges ||
    canListTerminals ||
    canListSheets ||
    canListStaplings;

  const renderModuleCard = (title: string, path: string) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(path as any)}
      className="flex-row items-center justify-between rounded-lg border border-outline-200 bg-background-0 px-4 py-4 mb-3 shadow-sm shadow-background-900/5"
    >
      <Text className="font-semibold text-typography-950">{title}</Text>
      <ChevronRight size={20} color="#64748B" />
    </TouchableOpacity>
  );

  return (
    <ScreenLayout
      title={user?.name?.split(' ')[0] ?? 'Usuário'}
      subtitle="Olá,"
      contentContainerStyle={{ paddingHorizontal: 0 }}
    >
      {!hasAnyPermission ? (
        <View className="flex-1 items-center justify-center py-20 px-6">
          <Text className="text-error-600 text-center font-semibold text-lg">
            Você não tem acesso a nenhum módulo. Fale com o administrador.
          </Text>
        </View>
      ) : (
        <View className="gap-6">
          {canListUsers && (
            <View>
              <Text size="2xs" className="font-semibold text-typography-500 uppercase mb-2">
                ADMINISTRAÇÃO
              </Text>
              {renderModuleCard(privateRoutes.users.name, privateRoutes.users.path)}
            </View>
          )}

          {(canListApplicators || canListGauges || canListTerminals) && (
            <View>
              <Text size="2xs" className="font-semibold text-typography-500 uppercase mb-2">
                CADASTROS
              </Text>
              {canListApplicators && renderModuleCard(privateRoutes.applicators.name, privateRoutes.applicators.path)}
              {canListGauges && renderModuleCard(privateRoutes.gauges.name, privateRoutes.gauges.path)}
              {canListTerminals && renderModuleCard(privateRoutes.terminals.name, privateRoutes.terminals.path)}
            </View>
          )}

          {(canListSheets || canListStaplings) && (
            <View>
              <Text size="2xs" className="font-semibold text-typography-500 uppercase mb-2">
                PRODUÇÃO
              </Text>
              {canListSheets && renderModuleCard(privateRoutes.sheets.name, privateRoutes.sheets.path)}
              {canListStaplings && renderModuleCard(privateRoutes.staplings.name, privateRoutes.staplings.path)}
            </View>
          )}
        </View>
      )}
    </ScreenLayout>
  );
}
