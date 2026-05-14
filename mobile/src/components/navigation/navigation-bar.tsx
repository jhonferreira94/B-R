/**
 * Barra de navegação inferior flutuante e arredondada (shell).
 * Usado como tabBar customizado com @react-navigation/bottom-tabs.
 * Ícone de cada aba: passar só o componente em tabBarIconAs (ex.: tabBarIconAs: Home).
 * Oculta automaticamente quando o teclado está visível.
 */
import { getLabel } from '@react-navigation/elements';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';

export const NAVIGATION_BAR_HEIGHT = 100;

interface NavigationBarProps extends BottomTabBarProps {
  onCustomTabPress?: (routeName: string) => boolean;
}

export function NavigationBar({
  state,
  navigation,
  descriptors,
  onCustomTabPress,
}: NavigationBarProps) {
  const { isKeyboardVisible } = useKeyboardVisible();

  const focusedRoute = state.routes[state.index];
  const focusedOptions = focusedRoute ? descriptors[focusedRoute.key]?.options ?? {} : {};

  const { tabBarShowLabel = true } = focusedOptions;

  if (isKeyboardVisible) return null;

  return (
    <View
      className="absolute bottom-6 self-center h-[68px] rounded-[100px] border border-background-50 overflow-hidden bg-primary-50 px-4"
      pointerEvents="box-none"
    >
      <View className="flex-1 flex-row items-center justify-center gap-2 px-2">
        {state.routes
          .filter((route) => {
            const options = descriptors[route.key]?.options as {
              tabBarIconAs?: React.ComponentType;
            };
            return !!options?.tabBarIconAs;
          })
          .map((route) => {
            const descriptor = descriptors[route.key]!;
            const options = descriptor.options as typeof descriptor.options & {
              tabBarIconAs?: React.ComponentType;
            };
            const focused = focusedRoute?.key === route.key;

            const label = getLabel(
              {
                label:
                  typeof options.tabBarLabel === 'string' ? options.tabBarLabel : undefined,
                title: options.title,
              },
              route.name,
            );

            const TabIcon = options.tabBarIconAs;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                testID={options.tabBarButtonTestID}
                onPress={() => {
                  const customHandled = onCustomTabPress?.(route.name);
                  if (!customHandled) {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!focused && !event.defaultPrevented) {
                      navigation.navigate(route.name, route.params);
                    }
                  }
                }}
                className="items-center justify-center py-2 px-3"
              >
                <View
                  className={`mb-1 p-2 rounded-full overflow-hidden items-center justify-center ${
                    focused ? 'bg-primary-600' : 'bg-transparent'
                  }`}
                >
                  {TabIcon ? (
                    <Icon
                      as={TabIcon}
                      size="lg"
                      className={focused ? 'text-primary-0' : 'text-background-600'}
                    />
                  ) : null}
                </View>
                {tabBarShowLabel ? (
                  <Text
                    size="2xs"
                    className={`${
                      focused
                        ? 'text-primary-600 font-bold'
                        : 'text-background-600 font-medium'
                    }`}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
      </View>
    </View>
  );
}
