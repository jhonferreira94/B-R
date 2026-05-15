import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';
import {
  CreateClientSchema,
  UpdateClientSchema,
  ListClientsQuerySchema,
} from './clients.schema';
import { requireAuth } from '../../lib2/auth';
import { handleError } from '../../lib2/errors';
import * as service from './clients.service';

const region = 'southamerica-east1';

export const listClients = onCall({ region }, async (request) => {
  try {
    requireAuth(request);
    const query = ListClientsQuerySchema.parse(request.data ?? {});
    return await service.list(query);
  } catch (err) {
    throw handleError(err);
  }
});

export const createClient = onCall({ region }, async (request) => {
  try {
    const auth = requireAuth(request);
    const input = CreateClientSchema.parse(request.data);
    return await service.create(input, auth);
  } catch (err) {
    throw handleError(err);
  }
});

const UpdateClientPayloadSchema = z.object({
  id: z.string().min(1),
  data: UpdateClientSchema,
});

export const updateClient = onCall({ region }, async (request) => {
  try {
    requireAuth(request);
    const { id, data } = UpdateClientPayloadSchema.parse(request.data);
    await service.update(id, data);
    return { ok: true };
  } catch (err) {
    throw handleError(err);
  }
});

export const deleteClient = onCall({ region }, async (request) => {
  try {
    requireAuth(request);
    const { id } = z.object({ id: z.string().min(1) }).parse(request.data);
    await service.remove(id);
    return { ok: true };
  } catch (err) {
    throw handleError(err);
  }
});

export const seedClients = onCall({ region }, async (request) => {
  try {
    const auth = requireAuth(request);
    return await service.seed(auth);
  } catch (err) {
    throw handleError(err);
  }
});
