'use client';
import React from 'react';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { Platform, View } from 'react-native';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const dividerStyle = tva({
  base: '',
  variants: {
    orientation: {
      vertical: 'w-px h-full',
      horizontal: 'h-px w-full',
    },
  },
});

type IUIDividerProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof dividerStyle>;

const Divider = React.forwardRef<
  React.ComponentRef<typeof View>,
  IUIDividerProps
>(function Divider({ className, orientation = 'horizontal', style, ...props }, ref) {
  return (
    <View
      ref={ref}
      {...props}
      style={[{ backgroundColor: '#DDDCDB' }, style]}
      aria-orientation={orientation}
      role={Platform.OS === 'web' ? 'separator' : undefined}
      className={dividerStyle({
        orientation,
        class: className,
      })}
    />
  );
});

Divider.displayName = 'Divider';

export { Divider };
