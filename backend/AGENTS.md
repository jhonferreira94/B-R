# AGENTS.md — Backend (Firebase Functions TypeScript)

Regras específicas das Cloud Functions deste app.

---

## Stack obrigatória

- Firebase Functions v2
- TypeScript 5 (`strict: true`)
- Node 20
- Zod (schemas locais em cada feature)
- Firebase Admin SDK (Firestore)

---

## Estrutura

```
src/
├── features/[domain]/           # Feature-Based
│   ├── [domain].schema.ts      # schemas Zod + tipos (z.infer)
│   ├── [domain].handler.ts     # entrada: onCall / trigger / HTTP
│   ├── [domain].service.ts     # lógica de negócio
│   ├── [domain].repository.ts  # Firestore (sem interface)
│   └── index.ts                # exporta handlers
├── lib/                         # encapsulamentos compartilhados
│   ├── auth.ts                 # extrai context.auth + claims
│   ├── secrets.ts              # wrapper defineSecret
│   ├── errors.ts               # AppError + formatador
│   └── firestore.ts            # admin init + db
└── index.ts                     # registra todas as functions exportadas
```

**Sem `domain/`, `application/`, `infrastructure/`, `presentation/`, `use-cases/`, `ports/`, `adapters/`, `mappers/`.** Quatro arquivos por feature: schema, handler, service, repository. Justifique qualquer arquivo extra.

---

## Padrão de feature

### `[domain].schema.ts` — schemas Zod
- Define `XSchema`, `CreateXSchema`, `UpdateXSchema`, `ListXQuerySchema`.
- Exporta tipos via `z.infer`.
- **Mantém uma cópia equivalente em `apps/mobile/src/features/[domain]/schemas/`.** Atualize ambos lados juntos.

### `[domain].handler.ts` — entrada
- Apenas `onCall`/`onRequest`/`onDocumentWritten`.
- Valida input com schema Zod local.
- Extrai auth via `requireAuth(request)`.
- Chama `service`, formata resposta, traduz erros.

```typescript
import { onCall } from 'firebase-functions/v2/https';
import { CreateClientSchema } from './clients.schema';
import { requireAuth } from '../../lib/auth';
import { handleError } from '../../lib/errors';
import * as clientService from './clients.service';

export const createClient = onCall(async (request) => {
  try {
    const auth = requireAuth(request);
    const data = CreateClientSchema.parse(request.data);
    return await clientService.create(data, auth);
  } catch (err) {
    throw handleError(err);
  }
});
```

### `[domain].service.ts` — lógica de negócio
- Funções puras de regra de negócio.
- Chama repository diretamente (sem interface).
- Lança `AppError` com código + mensagem em português.

### `[domain].repository.ts` — persistência
- Funções tipadas que falam direto com Firestore.
- Sem ORM, sem QueryBuilder customizado, sem interface.
- Tipos importados de `./[domain].schema`.

---

## Auth (callable functions)

- Use `requireAuth(request)` de `lib/auth.ts`. Lança `AppError('UNAUTHENTICATED', ...)` se faltar.
- Custom claims via `context.auth.token.claims`.

---

## Secrets

- Sempre via Firebase Secrets (`defineSecret`). **Nunca** dotenv comitado.
- Wrapper em `lib/secrets.ts`.

```typescript
import { defineSecret } from 'firebase-functions/params';
export const STRIPE_KEY = defineSecret('STRIPE_KEY');
```

---

## Validação

- **Toda** entrada validada com Zod local. Sem exceção.
- Erros Zod são convertidos pelo `handleError` em formato compatível com mobile.

---

## Erros

`lib/errors.ts` define `AppError` + `handleError`. Padrão de erro deve ser consumível pelo mobile sem adaptação.

---

## Firestore

- `lib/firestore.ts` inicializa Admin SDK uma vez e exporta `db`.
- Tipagem via `z.infer<typeof Schema>` do schema local.
- Coleções como constantes no topo do repository.
- Timestamps em `number` (ms epoch).

---

## Anti-padrões (proibido)

- ❌ Use case por operação CRUD
- ❌ Interface de repository sem múltipla implementação real
- ❌ DTO por camada / mapper entre 3 representações
- ❌ `console.log` (use `logger` de `firebase-functions/logger`)
- ❌ Lógica de negócio no handler
- ❌ Acesso ao Firestore fora do repository
- ❌ Dotenv para secrets
- ❌ Function exportada sem registro em `src/index.ts`

---

## Sensores (gate de "pronto")

```bash
npm run sensor   # typecheck + lint
```

Falha em qualquer um = task não está pronta.

---

## Sincronia com mobile

Schemas Zod são **duplicados** entre backend e mobile (sem package compartilhado). Ao mudar um schema aqui:
1. Atualize `apps/mobile/src/features/[domain]/schemas/[domain].schema.ts` com o mesmo conteúdo.
2. Rode `npm run sensor` em ambos os apps.
