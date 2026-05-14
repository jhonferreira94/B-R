import { type ComponentType } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { Home, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationBar } from '@/components/navigation/navigation-bar';

type TabScreenOptions = {
  title?: string;
  tabBarIconAs?: ComponentType;
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <ThemeProvider value={DefaultTheme}>
      <Tabs
        tabBar={(props) => <NavigationBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          sceneStyle: {
            backgroundColor: 'rgb(255 255 255)',
            paddingBottom: insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ title: 'Início', tabBarIconAs: Home } as TabScreenOptions}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'Perfil', tabBarIconAs: UserRound } as TabScreenOptions}
        />
      </Tabs>
    </ThemeProvider>
  );
}
