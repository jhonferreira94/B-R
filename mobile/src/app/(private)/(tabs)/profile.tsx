import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { Button } from '@/components/layout/button';

export default function ProfileScreen() {
  const { session, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <ScreenLayout
      title="Perfil"
      contentContainerStyle={{ paddingHorizontal: 0, flexGrow: 1 }}
    >
      <VStack className="flex-1">
        <Box className="rounded-xl border border-outline-200 p-4 bg-background-0">
          <HStack className="items-center justify-between">
            <VStack>
              <Text size="xs" className="text-typography-500 uppercase tracking-wider">
                Nome
              </Text>
              <Text className="font-semibold text-typography-950">
                {session?.user.name ?? '-'}
              </Text>
            </VStack>
          </HStack>

          <Divider className="my-3" />

          <VStack>
            <Text size="xs" className="text-typography-500 uppercase tracking-wider">
              E-mail
            </Text>
            <Text className="text-typography-950">{session?.user.email ?? '-'}</Text>
          </VStack>
        </Box>

        <View className="flex-1 justify-end mt-12">
          <Button
            labelText="Sair do aplicativo"
            classNameButtonText="text-error-600 font-semibold"
            variant="link"
            buttonSize="lg"
            buttonTextSize="md"
            onPress={handleLogout}
          />
        </View>
      </VStack>
    </ScreenLayout>
  );
}
