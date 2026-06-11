import { onCall } from "firebase-functions/v2/https";
import { z } from "zod";
import {
  CreateClientSchema,
  UpdateClientSchema,
  ListClientsQuerySchema,
} from './clients.schema';
import { requireAuth, requireClaims } from '../../lib2/auth';
import { handleError } from '../../lib2/errors';
import { CALL_OPTIONS } from '../../lib2/options';
import * as service from './clients.service';

export const listClients = onCall(CALL_OPTIONS, async (request) => {
  try {
    requireAuth(request);
    const query = ListClientsQuerySchema.parse(request.data ?? {});
    return await service.list(query);
  } catch (err) {
    throw handleError(err);
  }
});

export const createClient = onCall(CALL_OPTIONS, async (request) => {
  try {
    const auth = requireClaims(request, ['create_clients']);
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

export const updateClient = onCall(CALL_OPTIONS, async (request) => {
  try {
    requireClaims(request, ['update_clients']);
    const { id, data } = UpdateClientPayloadSchema.parse(request.data);
    await service.update(id, data);
    return { ok: true };
  } catch (err) {
    throw handleError(err);
  }
});

export const deleteClient = onCall(CALL_OPTIONS, async (request) => {
  try {
    requireClaims(request, ['delete_clients']);
    const { id } = z.object({ id: z.string().min(1) }).parse(request.data);
    await service.remove(id);
    return { ok: true };
  } catch (err) {
    throw handleError(err);
  }
});

export const seedClients = onCall(CALL_OPTIONS, async (request) => {
  try {
    const auth = requireClaims(request, ['create_clients']);
    return await service.seed(auth);
  } catch (err) {
    throw handleError(err);
  }
});
