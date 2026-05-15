import { defineSecret } from "firebase-functions/params";

type SecretParam = ReturnType<typeof defineSecret>;

/**
 * Centralize todas as definições de secrets aqui.
 * Uso no handler:
 *
 *   import { STRIPE_KEY } from '../../firebase/secrets';
 *   export const charge = onCall({ secrets: [STRIPE_KEY] }, async (req) => {
 *     const key = STRIPE_KEY.value();
 *   });
 *
 * Para configurar:
 *   firebase functions:secrets:set STRIPE_KEY
 */

export const STRIPE_KEY: SecretParam = defineSecret("STRIPE_KEY");
// Adicione novos secrets aqui conforme necessário.
