import '../../global.css';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/providers/AuthProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <ReactQueryProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(private)" />
          </Stack>
        </ReactQueryProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
