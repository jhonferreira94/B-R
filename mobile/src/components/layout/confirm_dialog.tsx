import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/layout/button';
import { Text } from '@/components/ui/text';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} size="md">
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Text className="text-typography-950 font-semibold" size="lg">
            {title}
          </Text>
        </AlertDialogHeader>
        <AlertDialogBody className="mt-3 mb-4">
          <Text size="sm" className='text-typography-600'>Ao excluir {message}, todos os dados associados serão removidos. Deseja continuar?</Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            labelText={cancelLabel}
            classNameButtonText="text-typography-500 font-medium"
            classNameButton='border border-secondary-300'
            variant="outline"
            buttonSize="sm"
            buttonTextSize="sm"
            isDisabled={isLoading}
            onPress={onClose}
          />
          <Button
            labelText={confirmLabel}
            classNameButtonText="text-typography-0 font-medium"
            action="negative"
            buttonSize="sm"
            buttonTextSize="sm"
            isLoading={isLoading}
            onPress={onConfirm}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
