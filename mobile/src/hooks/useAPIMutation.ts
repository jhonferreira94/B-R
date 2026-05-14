import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { getResponseError } from '@/utils/api';
import { useAppToast } from '@/hooks/useAppToast';

interface UseAPIMutationOptions<TResult, TInput> {
  mutationFn: (input: TInput) => Promise<TResult>;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueryKey?: QueryKey;
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
}

export function useAPIMutation<TResult, TInput>(opts: UseAPIMutationOptions<TResult, TInput>) {
  const qc = useQueryClient();
  const toast = useAppToast();
  return useMutation<TResult, unknown, TInput>({
    mutationFn: opts.mutationFn,
    onSuccess: (result) => {
      if (opts.invalidateQueryKey) qc.invalidateQueries({ queryKey: opts.invalidateQueryKey });
      if (opts.successMessage) toast.showSuccess(opts.successMessage);
      opts.onSuccess?.(result);
    },
    onError: (error) => {
      const err = getResponseError(error);
      const msg = opts.errorMessage ?? err.message ?? err.description ?? 'Falha na operação';
      toast.showError(msg);
      opts.onError?.(error);
    },
  });
}
