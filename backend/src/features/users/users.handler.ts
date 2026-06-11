import { createHash, timingSafeEqual } from 'node:crypto';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { handleError } from '../../firebase/errors';
import { CALL_OPTIONS } from '../../firebase/options';
import { ADMIN_PASSWORD, SEED_KEY } from '../../firebase/secrets';
import * as service from './users.service';

const SeedAdminPayloadSchema = z.object({
  seedKey: z.string().min(1, { message: 'seedKey é obrigatório' }),
});

function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export const seedAdmin = onCall(
  { ...CALL_OPTIONS, secrets: [SEED_KEY, ADMIN_PASSWORD] },
  async (request) => {
    try {
      const { seedKey } = SeedAdminPayloadSchema.parse(request.data ?? {});
      if (!safeEqual(seedKey, SEED_KEY.value())) {
        throw new HttpsError('permission-denied', 'Chave de seed inválida');
      }
      return await service.seedAdmin(ADMIN_PASSWORD.value());
    } catch (err) {
      throw handleError(err);
    }
  },
);
