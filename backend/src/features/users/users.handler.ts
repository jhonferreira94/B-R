import { onCall } from 'firebase-functions/v2/https';
import { handleError } from '../../lib/errors';
import * as service from './users.service';

const region = 'southamerica-east1';

export const seedAdmin = onCall({ region }, async () => {
  try {
    return await service.seedAdmin();
  } catch (err) {
    throw handleError(err);
  }
});
