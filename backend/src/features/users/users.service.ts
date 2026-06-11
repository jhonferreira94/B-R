import { getAuth } from 'firebase-admin/auth';
import * as repo from './users.repository';
import { ALL_CLIENT_CLAIMS, type User } from './users.schema';

export interface SeedAdminResult {
  uid: string;
  email: string;
  created: boolean;
  message: string;
}

const ADMIN_PROFILE = {
  email: 'admin@sebrae.com',
  name: 'Administrador Sebrae',
};

export async function seedAdmin(password: string): Promise<SeedAdminResult> {
  const auth = getAuth();
  const claims = [...ALL_CLIENT_CLAIMS];
  const role = 'admin';

  let uid: string;
  let created = false;

  try {
    const existing = await auth.getUserByEmail(ADMIN_PROFILE.email);
    uid = existing.uid;
  } catch {
    const newUser = await auth.createUser({
      email: ADMIN_PROFILE.email,
      password,
      displayName: ADMIN_PROFILE.name,
      emailVerified: true,
    });
    uid = newUser.uid;
    created = true;
  }

  await auth.setCustomUserClaims(uid, { role, claims });

  const now = new Date().toISOString();
  const existingDoc = await repo.findByUid(uid);
  const user: User = {
    uid,
    name: ADMIN_PROFILE.name,
    email: ADMIN_PROFILE.email,
    role,
    claims,
    createdAt: existingDoc?.createdAt ?? now,
    updatedAt: now,
  };
  await repo.upsert(user);

  return {
    uid,
    email: ADMIN_PROFILE.email,
    created,
    message: created
      ? 'Admin criado. Use a senha configurada no secret ADMIN_PASSWORD para entrar.'
      : 'Admin já existia. Claims e documento atualizados.',
  };
}
