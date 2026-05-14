import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FirebaseError } from 'firebase/app';
import { sendPasswordReset } from '@/features/auth/services/auth.service';
import {
  ResetPasswordSchema,
  type ResetPasswordFormData,
} from '@/features/auth/schemas/auth.schema';
import { useAppToast } from '@/hooks/useAppToast';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/layout/button';
import { Leading } from '@/components/navigation/leading-navigation';
import { FormControl } from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';
import { ApplicationImagePath } from '@/constants/enums/application-image.enum';

export default function ForgotPasswordScreen() {
  const [isPending, setIsPending] = useState(false);
  const toast = useAppToast();
  const { control, handleSubmit } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: ResetPasswordFormData) => {
    setIsPending(true);
    try {
      await sendPasswordReset(email);
      toast.showSuccess('E-mail de recuperação enviado.');
      router.back();
    } catch (error) {
      const msg =
        error instanceof FirebaseError && error.code === 'auth/user-not-found'
          ? 'E-mail não cadastrado.'
          : 'Não foi possível enviar o e-mail. Tente novamente.';
      toast.showError(msg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SafeAreaView className="flex-grow px-4">
      <Leading />

      <View className="items-center mt-4 mb-8">
        <ApplicationImagePath.logo width={72} height={80} />
      </View>

      <View className="flex-1 gap-6">
        <View>
          <Text size="4xl" className="font-bold text-typography-950">
            Esqueceu sua senha?
          </Text>
          <Text size="sm" className="text-typography-950 mt-1">
            Vamos enviar um e-mail com um link para que você possa definir uma
            nova senha com segurança.
          </Text>
        </View>

        <FormControl className="gap-3">
          <Input<ResetPasswordFormData>
            control={control}
            name="email"
            placeholder="user@email.com.br"
            keyboardType="email-address"
          />
        </FormControl>
      </View>

      <View className="pb-4">
        <Button
          labelText="Pedir uma nova senha"
          isDisabled={isPending}
          isLoading={isPending}
          onPress={handleSubmit(onSubmit)}
        />

        <Button
          labelText="Cancelar"
          classNameButton="mt-3"
          classNameButtonText="text-primary-600 font-bold"
          variant="link"
          isDisabled={isPending}
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}
