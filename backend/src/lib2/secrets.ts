import { defineSecret } from 'firebase-functions/params';

type SecretParam = ReturnType<typeof defineSecret>;

/**
 * Centralize todas as definições de secrets aqui.
 * Uso no handler:
 *
 *   import { SEED_KEY } from '../../lib2/secrets';
 *   export const fn = onCall({ secrets: [SEED_KEY] }, async (req) => {
 *     const key = SEED_KEY.value();
 *   });
 *
 * Para configurar em produção:
 *   firebase functions:secrets:set SEED_KEY
 *   firebase functions:secrets:set ADMIN_PASSWORD
 *
 * No emulator, defina os valores em `backend/.secret.local`.
 */

export const SEED_KEY: SecretParam = defineSecret('SEED_KEY');
export const ADMIN_PASSWORD: SecretParam = defineSecret('ADMIN_PASSWORD');
