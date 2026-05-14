import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FirebaseError } from 'firebase/app';
import { signUp } from '@/features/auth/services/auth.service';
import { SignUpSchema, type SignUpFormData } from '@/features/auth/schemas/auth.schema';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/layout/button';
import { Leading } from '@/components/navigation/leading-navigation';
import { FormControl } from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';
import { ApplicationImagePath } from '@/constants/enums/application-image.enum';
import { CreateAccountFeedback } from '@/features/auth/components/create-account-feedback';

const KEYBOARD_EXTRA_PADDING = 280;

type ScreenState = 'NONE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export default function SignUpScreen() {
  const [state, setState] = useState<ScreenState>('NONE');
  const { isKeyboardVisible } = useKeyboardVisible();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onChange',
    defaultValues: {
      name: 'user',
      email: 'user@email.com',
      cpf: '012.345.678-90',
      password: 'sebrae@123',
      confirmPassword: 'sebrae@123',
    },
  });

  const onSubmit = async ({ name, email, password }: SignUpFormData) => {
    setState('LOADING');
    try {
      await signUp({ name, email, password });
      setState('SUCCESS');
      await new Promise((r) => setTimeout(r, 1800));
      router.replace('/home');
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        setState('NONE');
        return;
      }
      setState('ERROR');
      await new Promise((r) => setTimeout(r, 2000));
      setState('NONE');
    }
  };

  if (state === 'LOADING' || state === 'SUCCESS' || state === 'ERROR') {
    const feedbackState =
      state === 'LOADING' ? 'loading' : state === 'SUCCESS' ? 'success' : 'error';
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
        <SafeAreaView className="flex-1">
          <CreateAccountFeedback state={feedbackState} />
        </SafeAreaView>
      </Animated.View>
    );
  }

  const isPending = false;

  return (
    <SafeAreaView className="flex-1 px-4">
      <Leading />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: isKeyboardVisible ? KEYBOARD_EXTRA_PADDING : 16,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mt-4 mb-8">
            <ApplicationImagePath.logo width={72} height={80} />
          </View>

          <View className="gap-4">
            <View>
              <Text size="4xl" className="font-bold text-typography-950">
                Pronto para começar?
              </Text>

              <Text size="sm" className="text-typography-950 mt-2">
                Preencha suas informações e finalize o cadastro quando estiver
                pronto.
              </Text>
            </View>

            <FormControl className="gap-3">
              <Input<SignUpFormData>
                control={control}
                name="name"
                label="Nome"
                placeholder="Digite seu nome"
              />

              <Input<SignUpFormData>
                control={control}
                name="cpf"
                label="CPF"
                placeholder="000.000.000-00"
                mask="cpf"
                keyboardType="numeric"
              />

              <Input<SignUpFormData>
                control={control}
                name="email"
                label="E-mail"
                helperTextNode={
                  <Text size="sm" className="text-typography-500">
                    Você já é cadastrado e{' '}
                    <Text
                      size="sm"
                      className="text-typography-950 underline"
                      onPress={() => router.push('/forgot-password')}
                    >
                      esqueceu sua senha?
                    </Text>
                  </Text>
                }
                placeholder="user@email.com.br"
                keyboardType="email-address"
              />

              <Input<SignUpFormData>
                control={control}
                name="password"
                label="Senha"
                type="password"
                placeholder="Crie uma senha segura"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input<SignUpFormData>
                control={control}
                name="confirmPassword"
                label="Confirmar senha"
                type="password"
                placeholder="Digite sua senha novamente"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </FormControl>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="gap-3 mt-3 pb-2">
        <Button
          labelText="Confirmar cadastro"
          isDisabled={isPending || !isValid}
          isLoading={isPending}
          onPress={handleSubmit(onSubmit)}
        />

        <Button
          labelText="Cancelar"
          classNameButtonText="text-primary-600 font-medium"
          variant="link"
          isDisabled={isPending}
          onPress={() => router.push('/login')}
        />
      </View>
    </SafeAreaView>
  );
}
