import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FirebaseError } from 'firebase/app';
import { signOut } from 'firebase/auth';

import { changePassword } from '@/features/auth/services/auth.service';
import { auth } from '@/configs/firebase';
import {
  ChangePasswordSchema,
  type ChangePasswordFormData,
} from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/providers/AuthProvider';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { useAppToast } from '@/hooks/useAppToast';

import { Input } from '@/components/forms/input';
import { Button } from '@/components/layout/button';
import { FormControl } from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';

const KEYBOARD_EXTRA_PADDING = 280;

function describeError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      return 'A senha atual está incorreta.';
    }
  }
  return 'Não foi possível alterar a senha. Tente novamente.';
}

export default function ChangePasswordScreen() {
  const { session } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const { isKeyboardVisible } = useKeyboardVisible();
  const toast = useAppToast();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async ({ currentPassword, newPassword }: ChangePasswordFormData) => {
    setIsPending(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.showSuccess('Senha alterada com sucesso!');
      router.replace('/home');
    } catch (error) {
      toast.showError(describeError(error));
      setIsPending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  // Por segurança, defina uma nova senha antes de continuar.
  // Pode ser checado no session token (mustChangePassword) futuramente, aqui sempre assumiremos `true` caso a tela seja montada sob roteamento imperativo forçado.
  const isForcedChange = true;

  return (
    <SafeAreaView className="flex-1 px-4">
      {isForcedChange && (
        <View className="bg-warning-100 p-3 rounded-md mb-4 mt-2">
          <Text size="sm" className="text-warning-800 font-medium text-center">
            Por segurança, defina uma nova senha antes de continuar.
          </Text>
        </View>
      )}

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
          <View className="mt-4 mb-8">
            <Text size="3xl" className="font-bold text-typography-950">
              Alterar senha
            </Text>
            <Text size="sm" className="text-typography-950 mt-2">
              Sua nova senha deve seguir os requisitos de segurança.
            </Text>
          </View>

          <FormControl className="gap-4">
            <Input<ChangePasswordFormData>
              control={control}
              name="currentPassword"
              label="Senha Atual"
              placeholder="Digite sua senha atual"
              type="password"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input<ChangePasswordFormData>
              control={control}
              name="newPassword"
              label="Nova Senha"
              placeholder="Crie uma nova senha"
              type="password"
              autoCapitalize="none"
              autoCorrect={false}
              helperTextNode={
                <Text size="sm" className="text-typography-500">
                  Min 8 chars, com maiúscula, minúscula e dígito
                </Text>
              }
            />

            <Input<ChangePasswordFormData>
              control={control}
              name="confirmNewPassword"
              label="Confirmar Nova Senha"
              placeholder="Digite a nova senha novamente"
              type="password"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </FormControl>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="gap-3 mt-3 pb-2">
        <Button
          labelText="Alterar senha"
          isDisabled={!isValid || isPending}
          isLoading={isPending}
          onPress={handleSubmit(onSubmit)}
        />

        <Button
          labelText="Sair"
          isDisabled={isPending}
          classNameButtonText="text-error-600 font-medium"
          variant="link"
          onPress={handleSignOut}
        />
      </View>
    </SafeAreaView>
  );
}
