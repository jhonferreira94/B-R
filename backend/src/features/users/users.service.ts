import { getAuth } from 'firebase-admin/auth';
import * as repo from './users.repository';
import { ALL_CLIENT_CLAIMS, type User } from './users.schema';

export interface SeedAdminResult {
  uid: string;
  email: string;
  password: string;
  created: boolean;
  message: string;
}

const DEFAULT_ADMIN = {
  email: 'admin@sebrae.com',
  password: 'sebrae@123',
  name: 'Administrador Sebrae',
};

export async function seedAdmin(): Promise<SeedAdminResult> {
  const auth = getAuth();
  const claims = [...ALL_CLIENT_CLAIMS];
  const role = 'admin';

  let uid: string;
  let created = false;

  try {
    const existing = await auth.getUserByEmail(DEFAULT_ADMIN.email);
    uid = existing.uid;
  } catch {
    const newUser = await auth.createUser({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      displayName: DEFAULT_ADMIN.name,
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
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    role,
    claims,
    createdAt: existingDoc?.createdAt ?? now,
    updatedAt: now,
  };
  await repo.upsert(user);

  return {
    uid,
    email: DEFAULT_ADMIN.email,
    password: DEFAULT_ADMIN.password,
    created,
    message: created
      ? 'Admin criado. Use as credenciais retornadas para entrar.'
      : 'Admin já existia. Claims e documento atualizados.',
  };
}
