import { httpsCallable, type HttpsCallableOptions } from 'firebase/functions';
import type { ZodType, ZodTypeDef } from 'zod';
import { functions } from '@/configs/firebase';

export interface RequestConfig<T> {
  data?: unknown;
  options?: HttpsCallableOptions;
  /** Quando informado, valida a resposta em runtime e detecta drift de contrato. */
  schema?: ZodType<T, ZodTypeDef, unknown>;
}

export async function request<T>(name: string, config?: RequestConfig<T>): Promise<T> {
  const callable = httpsCallable<unknown, T>(functions, name, config?.options);
  const result = await callable(config?.data ?? {});
  return config?.schema ? config.schema.parse(result.data) : result.data;
}
