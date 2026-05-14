import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Icon, CheckCircleIcon, AlertCircleIcon } from '@/components/ui/icon';

export type CreateAccountState = 'loading' | 'success' | 'error';

interface Props {
  state: CreateAccountState;
}

const MESSAGES: Record<CreateAccountState, string> = {
  loading: 'Organizando tudo\npara você começar',
  success: 'Tudo certo!',
  error: 'Ocorreu um erro ao criar a conta',
};

export function CreateAccountFeedback({ state }: Props) {
  return (
    <VStack className="flex-1 items-center justify-center gap-6 px-6">
      {state === 'loading' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(100)}
          className="h-[160px] w-[160px] items-center justify-center"
        >
          <Spinner size="large" className="text-primary-500" />
        </Animated.View>
      )}

      {state === 'success' && (
        <Animated.View entering={ZoomIn.springify().damping(40)}>
          <Box className="h-[160px] w-[160px] rounded-full bg-success-300 items-center justify-center">
            <Icon as={CheckCircleIcon} className="text-typography-0 h-[110px] w-[110px]" />
          </Box>
        </Animated.View>
      )}

      {state === 'error' && (
        <Animated.View entering={ZoomIn.springify().damping(40)}>
          <Box className="h-[160px] w-[160px] rounded-full bg-error-300 items-center justify-center">
            <Icon as={AlertCircleIcon} className="text-typography-0 h-[110px] w-[110px]" />
          </Box>
        </Animated.View>
      )}

      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(100)}>
        <Text
          size="2xl"
          className="text-background-600 text-center font-normal"
        >
          {MESSAGES[state]}
        </Text>
      </Animated.View>
    </VStack>
  );
}
