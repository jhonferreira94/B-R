import React from 'react';
import { View, StyleProp, ViewStyle, ScrollViewProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CollapsibleHeader, HEADER_MAX_HEIGHT } from './collapsible-header';

export interface ScreenLayoutProps extends ScrollViewProps {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function ScreenLayout({
  title,
  subtitle,
  headerRight,
  contentContainerStyle,
  children,
  ...props
}: ScreenLayoutProps) {
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View className="flex-1 bg-background-50">
      <CollapsibleHeader
        scrollY={scrollY}
        title={title}
        subtitle={subtitle}
        rightElement={headerRight}
      />

      <Animated.ScrollView
        {...props}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            paddingTop: HEADER_MAX_HEIGHT + insets.top + 24,
            paddingBottom: 120, // Garante espaço livre pro TabBar ou botões rodapé
            paddingHorizontal: 16,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}
