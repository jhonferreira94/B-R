import { httpsCallable, type HttpsCallableOptions } from 'firebase/functions';
import { functions } from '@/configs/firebase';

export interface RequestConfig {
  data?: unknown;
  options?: HttpsCallableOptions;
}

export async function request<T>(
  name: string,
  _method: 'POST' | 'GET' = 'POST',
  config?: RequestConfig,
): Promise<T> {
  const callable = httpsCallable<unknown, T>(functions, name, config?.options);
  const result = await callable(config?.data ?? {});
  return result.data;
}
