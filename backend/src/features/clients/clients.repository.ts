import { db } from '../../lib2/firestore';
import type { Client, CreateClientInput, ListClientsQuery } from './clients.schema';

const COLLECTION = 'clients';
const BATCH_LIMIT = 500;

type ClientDoc = Omit<Client, 'id'> & { nameLowercase?: string };

function toClient(id: string, raw: FirebaseFirestore.DocumentData): Client {
  const data = { ...(raw as ClientDoc) };
  delete data.nameLowercase;
  return { id, ...data };
}

export async function findById(id: string): Promise<Client | null> {
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return toClient(snap.id, snap.data()!);
}

export async function list(query: ListClientsQuery): Promise<{ items: Client[]; total: number }> {
  let ref: FirebaseFirestore.Query = db.collection(COLLECTION);
  if (query.isActive !== undefined) {
    ref = ref.where('isActive', '==', query.isActive);
  }

  if (query.search) {
    const term = query.search.toLowerCase();
    ref = ref
      .where('nameLowercase', '>=', term)
      .where('nameLowercase', '<=', `${term}\uf8ff`)
      .orderBy('nameLowercase');
  } else {
    ref = ref.orderBy('createdAt', 'desc');
  }

  const totalSnap = await ref.count().get();
  const total = totalSnap.data().count;

  const offset = (query.page - 1) * query.pageSize;
  const pageSnap = await ref.offset(offset).limit(query.pageSize).get();

  const items = pageSnap.docs.map((d) => toClient(d.id, d.data()));
  return { items, total };
}

export async function count(): Promise<number> {
  const snap = await db.collection(COLLECTION).count().get();
  return snap.data().count;
}

export async function bulkCreate(
  inputs: Array<CreateClientInput & { createdBy: string }>,
): Promise<number> {
  const now = Date.now();
  for (let i = 0; i < inputs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const input of inputs.slice(i, i + BATCH_LIMIT)) {
      const ref = db.collection(COLLECTION).doc();
      batch.set(ref, {
        ...input,
        nameLowercase: input.name.toLowerCase(),
        isActive: true,
        createdAt: now,
      });
    }
    await batch.commit();
  }
  return inputs.length;
}

export async function create(
  input: CreateClientInput & { createdBy: string },
): Promise<Client | null> {
  const now = Date.now();
  const data = {
    ...input,
    nameLowercase: input.name.toLowerCase(),
    isActive: true,
    createdAt: now,
  };
  const ref = db.collection(COLLECTION).doc();

  const created = await db.runTransaction(async (t) => {
    const dup = await t.get(
      db.collection(COLLECTION).where('document', '==', input.document).limit(1),
    );
    if (!dup.empty) return false;
    t.set(ref, data);
    return true;
  });

  if (!created) return null;
  return toClient(ref.id, data);
}

export type UpdateResult = 'updated' | 'not_found' | 'duplicated';

export async function update(
  id: string,
  input: Partial<CreateClientInput>,
): Promise<UpdateResult> {
  const ref = db.collection(COLLECTION).doc(id);

  return db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) return 'not_found';

    if (input.document) {
      const dup = await t.get(
        db.collection(COLLECTION).where('document', '==', input.document).limit(1),
      );
      if (!dup.empty && dup.docs[0]!.id !== id) return 'duplicated';
    }

    const patch: Record<string, unknown> = { ...input };
    if (input.name) patch.nameLowercase = input.name.toLowerCase();
    t.update(ref, patch);
    return 'updated';
  });
}

export async function remove(id: string): Promise<void> {
  await db.collection(COLLECTION).doc(id).delete();
}
