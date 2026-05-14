export interface ResponseError<T = unknown> {
  name?: string;
  description?: string;
  fieldErrors?: Record<keyof T, string[]> | null;
  message?: string | null;
  statusCode?: string;
  details?: string | null;
}

/**
 * Extrai o payload de erro padronizado das respostas da API.
 * Compatível com `handleError` do backend (apps/functions/src/lib/errors.ts).
 */
export function getResponseError<T = unknown>(error: unknown): ResponseError<T> {
  // Erros de Firebase Functions Callable vêm em error.details
  const anyErr = error as { details?: ResponseError<T>; response?: { data?: ResponseError<T> }; message?: string };
  if (anyErr?.details) return anyErr.details;
  if (anyErr?.response?.data) return anyErr.response.data;
  return { message: anyErr?.message ?? 'Erro inesperado' };
}

export function hasFieldErrors(error: unknown): boolean {
  const err = getResponseError(error);
  return !!err.fieldErrors && Object.keys(err.fieldErrors).length > 0;
}

/**
 * Aplica erros de campo da API diretamente no React Hook Form.
 * Uso:
 *   try { await mutate(data) } catch (err) {
 *     if (hasFieldErrors(err)) handleFieldErrors(err, setError);
 *   }
 */
export function handleFieldErrors<T extends Record<string, unknown>>(
  error: unknown,
  setError: (field: keyof T, opts: { type: string; message: string }) => void,
): void {
  const err = getResponseError<T>(error);
  if (!err.fieldErrors) return;
  for (const [field, messages] of Object.entries(err.fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      setError(field as keyof T, { type: 'server', message: messages[0]! });
    }
  }
}
