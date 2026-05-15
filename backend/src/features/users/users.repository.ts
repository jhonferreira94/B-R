import { db } from '../../lib2/firestore';
import type { User } from './users.schema';

const COLLECTION = 'users';

export async function upsert(user: User): Promise<void> {
  await db.collection(COLLECTION).doc(user.uid).set(user, { merge: true });
}

export async function findByUid(uid: string): Promise<User | null> {
  const snap = await db.collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as User;
}
