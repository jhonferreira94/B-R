import { useCallback, useMemo } from 'react';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';

type Variant = 'success' | 'error' | 'warning' | 'info';

export function useAppToast() {
  const toast = useToast();

  const show = useCallback(
    (variant: Variant, title: string, description?: string) => {
      const id = `${variant}-${title}`;
      if (toast.isActive(id)) return;
      toast.show({
        id,
        placement: 'top',
        duration: 4000,
        render: ({ id: renderId }) => (
          <Toast nativeID={`toast-${renderId}`} action={variant} variant="solid">
            <VStack className="gap-1">
              <ToastTitle>{title}</ToastTitle>
              {description ? <ToastDescription>{description}</ToastDescription> : null}
            </VStack>
          </Toast>
        ),
      });
    },
    [toast],
  );

  return useMemo(
    () => ({
      showSuccess: (title: string, description?: string) => show('success', title, description),
      showError: (title: string, description?: string) => show('error', title, description),
      showWarning: (title: string, description?: string) => show('warning', title, description),
      showInfo: (title: string, description?: string) => show('info', title, description),
    }),
    [show],
  );
}
