import React from 'react';
import { View, StyleProp, ViewStyle, FlatListProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CollapsibleHeader, HEADER_MAX_HEIGHT } from './collapsible-header';

export interface ScreenListLayoutProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  data: ReadonlyArray<T> | null | undefined;
  renderItem: FlatListProps<T>['renderItem'];
}

export function ScreenListLayout<T>({
  title,
  subtitle,
  headerRight,
  contentContainerStyle,
  data,
  renderItem,
  ...props
}: ScreenListLayoutProps<T>) {
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

      <Animated.FlatList
        data={data as any}
        renderItem={renderItem}
        {...(props as any)}
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
      />
    </View>
  );
}
