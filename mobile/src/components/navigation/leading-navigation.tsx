import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeftIcon, Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

const ARROW_LEFT_WIDTH = 'w-[42px]';
const ARROW_LEFT_HEIGHT = 'h-[42px]';

interface LeadingProps {
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  title?: string;
  pb?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  itemsColor?: string;
  onPress?: () => void;
}

const pbClass: Record<string, string> = {
  xs: 'pb-1',
  sm: 'pb-2',
  md: 'pb-3',
  lg: 'pb-4',
  xl: 'pb-5',
  '2xl': 'pb-6',
};

export function Leading({
  iconSize,
  title,
  pb = 'md',
  className,
  itemsColor,
  onPress,
}: LeadingProps) {
  return (
    <View className={`flex ${title === undefined ? '' : 'pt-6'} ${pbClass[pb]} ${className ?? ''}`}>
      <TouchableOpacity
        onPress={onPress ? onPress : () => router.back()}
        className="flex flex-row items-center justify-start"
      >
        <Icon
          as={ArrowLeftIcon}
          size={iconSize}
          className={`${iconSize === undefined ? `${ARROW_LEFT_WIDTH} ${ARROW_LEFT_HEIGHT}` : ''} ${itemsColor !== undefined ? itemsColor : !title ? 'text-background-500' : 'text-primary-900'}`}
        />
        {title && (
          <Text size="xl" className={`ml-2 font-bold ${itemsColor}`}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
