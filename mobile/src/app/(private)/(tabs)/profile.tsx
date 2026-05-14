import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { Button } from '@/components/layout/button';
import { NAVIGATION_BAR_HEIGHT } from '@/components/navigation/navigation-bar';

export default function ProfileScreen() {
  const { session, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background-0 px-4">
      <VStack className="flex-1">
        <Heading size="2xl" className="text-typography-950 mt-4 mb-6">
          Perfil
        </Heading>

        <Box className="rounded-xl border border-outline-200 p-4">
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

        <VStack style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: NAVIGATION_BAR_HEIGHT }}>
          <Button
            labelText="Sair do aplicativo"
            classNameButtonText="text-error-600 font-semibold"
            variant="link"
            buttonSize="lg"
            buttonTextSize="md"
            onPress={handleLogout}
          />
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
