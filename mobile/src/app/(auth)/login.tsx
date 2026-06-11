import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FirebaseError } from 'firebase/app';
import { signIn } from '@/features/auth/services/auth.service';
import { SignInSchema, type SignInFormData } from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/providers/AuthProvider';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { useAppToast } from '@/hooks/useAppToast';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/layout/button';
import { FormControl } from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';
import { ApplicationImagePath } from '@/constants/enums/application-image.enum';

function describeAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'E-mail ou senha inválidos.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente em instantes.';
      case 'auth/network-request-failed':
        return 'Falha de rede. Verifique sua conexão.';
      default:
        return 'Não foi possível entrar. Tente novamente.';
    }
  }
  return 'Não foi possível entrar. Tente novamente.';
}

export default function SignInScreen() {
  const { isKeyboardVisible, dismissKeyboard } = useKeyboardVisible();
  const toast = useAppToast();
  const { session } = useAuth();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (session) router.replace('/home');
  }, [session]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isKeyboardVisible ? 0.6 : 1, { duration: 250 }) },
        { translateY: withTiming(isKeyboardVisible ? -20 : 0, { duration: 250 }) },
      ],
      opacity: withTiming(isKeyboardVisible ? 0.85 : 1, { duration: 200 }),
    };
  }, [isKeyboardVisible]);

  const { handleSubmit, control } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: SignInFormData) => {
    setIsPending(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      toast.showError(describeAuthError(error));
      setIsPending(false);
    }
  };

  return (
    <SafeAreaView className="flex-grow px-4">
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={logoAnimatedStyle}
            className={`${isKeyboardVisible ? '' : 'flex-grow'} justify-center items-center`}
          >
            <ApplicationImagePath.logo width={88} height={98} />
          </Animated.View>

          <FormControl className={`${isKeyboardVisible ? '' : 'flex-grow'}`}>
            <View className="gap-3">
              <Input<SignInFormData>
                control={control}
                name="email"
                label="E-mail"
                placeholder="e-mail@exemplo.com.br"
                keyboardType="email-address"
              />

              <Input<SignInFormData>
                control={control}
                name="password"
                label="Senha"
                placeholder="Digite sua senha"
                type="password"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              disabled={isPending}
            >
              <Text className="text-right mt-2 text-typography-950" size="sm">
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>
          </FormControl>

          <View className={`flex pb-4 ${isKeyboardVisible ? 'mt-6' : ''}`}>
            <Button
              labelText="Acessar"
              isDisabled={isPending}
              isLoading={isPending}
              buttonSize="xl"
              buttonTextSize="lg"
              onPress={handleSubmit(onSubmit)}
            />

            <Button
              labelText="Quero me cadastrar"
              isDisabled={isPending}
              classNameButton="mt-3"
              classNameButtonText="text-primary-600 font-semibold"
              variant="link"
              buttonSize="xl"
              buttonTextSize="lg"
              onPress={() => router.push('/signup')}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
