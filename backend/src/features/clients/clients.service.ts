import * as repo from "./clients.repository";
import { AppError } from "../../firebase/errors";
import type { AuthContext } from "../../firebase/auth";
import type {
  CreateClientInput,
  ListClientsQuery,
  ListClientsResponse,
} from "./clients.schema";

export async function list(
  query: ListClientsQuery,
): Promise<ListClientsResponse> {
  const { items, total } = await repo.list(query);
  const pageCount = Math.ceil(total / query.pageSize) || 1;
  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      pageCount,
      isFirstPage: query.page === 1,
      isLastPage: query.page >= pageCount,
    },
  };
}

export async function create(input: CreateClientInput, auth: AuthContext) {
  const client = await repo.create({ ...input, createdBy: auth.uid });
  if (!client) {
    throw new AppError('CLIENT_DUPLICATED', 'Já existe um cliente com este documento', {
      document: ['Documento já cadastrado'],
    });
  }
  return client;
}

export async function update(id: string, input: Partial<CreateClientInput>) {
  const result = await repo.update(id, input);
  if (result === 'not_found') throw new AppError('CLIENT_NOT_FOUND', 'Cliente não encontrado');
  if (result === 'duplicated') {
    throw new AppError('CLIENT_DUPLICATED', 'Já existe um cliente com este documento', {
      document: ['Documento já cadastrado'],
    });
  }
}

export async function remove(id: string) {
  const current = await repo.findById(id);
  if (!current)
    throw new AppError("CLIENT_NOT_FOUND", "Cliente não encontrado");
  await repo.remove(id);
}

const FIRST_NAMES = [
  "Ana",
  "Bruno",
  "Carla",
  "Daniel",
  "Eduarda",
  "Felipe",
  "Gabriela",
  "Henrique",
  "Isabela",
  "João",
  "Karen",
  "Lucas",
  "Mariana",
  "Nicolas",
  "Olivia",
  "Pedro",
  "Quezia",
  "Rafael",
  "Sofia",
  "Thiago",
  "Ursula",
  "Vinicius",
  "Wesley",
  "Yasmin",
  "Beatriz",
  "Caio",
  "Diana",
  "Eric",
  "Fernanda",
  "Gustavo",
];
const LAST_NAMES = [
  "Silva",
  "Souza",
  "Oliveira",
  "Santos",
  "Lima",
  "Pereira",
  "Costa",
  "Almeida",
  "Ferreira",
  "Rodrigues",
  "Carvalho",
  "Gomes",
  "Martins",
  "Araujo",
  "Rocha",
  "Ribeiro",
  "Barbosa",
  "Mendes",
  "Nogueira",
  "Cardoso",
];

function pseudoCpf(seed: number): string {
  const base = String(seed).padStart(11, "0").slice(-11);
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${base.slice(9)}`;
}

function pseudoPhone(seed: number): string {
  const ddd = 11 + (seed % 80);
  const tail = String(900000000 + ((seed * 7919) % 100000000)).slice(-9);
  return `(${ddd}) ${tail.slice(0, 5)}-${tail.slice(5)}`;
}

export async function seed(
  auth: AuthContext,
  total = 50,
): Promise<{ created: number; skipped: boolean }> {
  const existing = await repo.count();
  if (existing > 0) return { created: 0, skipped: true };

  const rows: Array<CreateClientInput & { createdBy: string }> = [];
  for (let i = 0; i < total; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length]!;
    const name = `${first} ${last}`;
    rows.push({
      name,
      document: pseudoCpf(10000000000 + i * 1234567),
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: pseudoPhone(i + 1),
      createdBy: auth.uid,
    });
  }

  const created = await repo.bulkCreate(rows);
  return { created, skipped: false };
}
