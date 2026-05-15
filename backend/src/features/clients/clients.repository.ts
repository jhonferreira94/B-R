import { db } from '../../lib2/firestore';
import type { Client, CreateClientInput, ListClientsQuery } from './clients.schema';

const COLLECTION = 'clients';

export async function findById(id: string): Promise<Client | null> {
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<Client, 'id'>) };
}

export async function findByDocument(document: string): Promise<Client | null> {
  const snap = await db
    .collection(COLLECTION)
    .where('document', '==', document)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return { id: doc.id, ...(doc.data() as Omit<Client, 'id'>) };
}

export async function list(query: ListClientsQuery): Promise<{ items: Client[]; total: number }> {
  let ref: FirebaseFirestore.Query = db.collection(COLLECTION);
  if (query.isActive !== undefined) {
    ref = ref.where('isActive', '==', query.isActive);
  }

  if (query.search) {
    const snap = await ref.orderBy('createdAt', 'desc').get();
    const term = query.search.toLowerCase();
    const filtered = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Client, 'id'>) }))
      .filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.document.toLowerCase().includes(term),
      );
    const offset = (query.page - 1) * query.pageSize;
    const items = filtered.slice(offset, offset + query.pageSize);
    return { items, total: filtered.length };
  }

  const totalSnap = await ref.count().get();
  const total = totalSnap.data().count;

  const offset = (query.page - 1) * query.pageSize;
  const pageSnap = await ref.orderBy('createdAt', 'desc').offset(offset).limit(query.pageSize).get();

  const items = pageSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Client, 'id'>) }));
  return { items, total };
}

export async function count(): Promise<number> {
  const snap = await db.collection(COLLECTION).count().get();
  return snap.data().count;
}

export async function bulkCreate(
  inputs: Array<CreateClientInput & { createdBy: string }>,
): Promise<number> {
  const batch = db.batch();
  const now = Date.now();
  for (const input of inputs) {
    const ref = db.collection(COLLECTION).doc();
    batch.set(ref, { ...input, isActive: true, createdAt: now });
  }
  await batch.commit();
  return inputs.length;
}

export async function create(
  input: CreateClientInput & { createdBy: string },
): Promise<Client> {
  const now = Date.now();
  const data = { ...input, isActive: true, createdAt: now };
  const ref = await db.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

export async function update(id: string, input: Partial<CreateClientInput>): Promise<void> {
  await db.collection(COLLECTION).doc(id).update(input);
}

export async function remove(id: string): Promise<void> {
  await db.collection(COLLECTION).doc(id).delete();
}
