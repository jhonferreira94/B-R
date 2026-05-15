import { HttpsError } from 'firebase-functions/v2/https';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Converte erros internos em HttpsError com payload compatível com
 * `getResponseError` / `handleFieldErrors` do mobile.
 */
export function handleError(err: unknown): HttpsError {
  if (err instanceof HttpsError) return err;

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return new HttpsError('invalid-argument', 'Dados inválidos', {
      name: 'ValidationError',
      description: 'Dados inválidos',
      fieldErrors,
      statusCode: '400',
    });
  }

  if (err instanceof AppError) {
    return new HttpsError('failed-precondition', err.message, {
      name: err.code,
      description: err.message,
      fieldErrors: err.fieldErrors ?? null,
      statusCode: '422',
    });
  }

  const message = err instanceof Error ? err.message : 'Erro inesperado';
  return new HttpsError('internal', message);
}
