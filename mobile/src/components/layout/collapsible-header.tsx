import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

export interface CollapsibleHeaderProps {
  scrollY: SharedValue<number>;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const HEADER_MAX_HEIGHT = 100;
export const HEADER_MIN_HEIGHT = 56;
export const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export function CollapsibleHeader({ scrollY, title, subtitle, rightElement }: CollapsibleHeaderProps) {
  const insets = useSafeAreaInsets();

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
      Extrapolation.CLAMP
    );
    const borderOpacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      height,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `rgba(203, 213, 225, ${borderOpacity})`, // outline-200 / slate-300
    };
  });

  const titleWrapperStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, subtitle ? -8 : 0], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }],
    };
  });

  const subtitleOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        headerStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: '#F8FAFC', // Tailwind slate-50, um branco levemente frio
          paddingTop: insets.top,
          paddingHorizontal: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          overflow: 'hidden',
        },
      ]}
    >
      <View style={{ flex: 1, justifyContent: 'center', height: '100%' }}>
        <Animated.View style={titleWrapperStyle}>
          {subtitle && (
            <Animated.View style={subtitleOpacityStyle}>
              <Text size="sm" className="text-typography-500 mb-1">
                {subtitle}
              </Text>
            </Animated.View>
          )}
          <Heading size="2xl" className="text-typography-950" numberOfLines={1}>
            {title}
          </Heading>
        </Animated.View>
      </View>
      
      {rightElement && (
        <View style={{ marginLeft: 16 }}>
          {rightElement}
        </View>
      )}
    </Animated.View>
  );
}
