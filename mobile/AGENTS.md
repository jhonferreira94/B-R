# AGENTS.md — Mobile (React Native + Expo)

Regras específicas do app mobile.

---

## Stack obrigatória

- Expo ~54.0 · React Native 0.81.5 · React 19
- TypeScript 5 (`strict: true`)
- Expo Router 6 (file-based)
- TanStack React Query 5
- Gluestack UI 3
- Zod (schemas locais em cada feature, espelhando o backend)
- React Hook Form + `@hookform/resolvers/zod`
- Axios
- Expo Secure Store (tokens)
- Node ≥ 20

---

## Estrutura

```
src/
├── app/                    # Expo Router
│   ├── (auth)/            # rotas públicas
│   ├── (private)/         # rotas protegidas
│   └── _layout.tsx
├── components/             # reutilizáveis globais (sem lógica de negócio)
├── configs/                # axios, tema
├── constants/              # rotas, tokens
├── features/[domain]/      # features auto-contidas
│   ├── components/
│   ├── schemas/           # schemas Zod (espelham backend)
│   │   └── [domain].schema.ts
│   ├── services/
│   │   ├── [domain].hooks.ts
│   │   └── [domain].types.ts
│   └── index.ts
├── hooks/                  # useAPIQuery, useAPIMutation
├── providers/              # AuthProvider, ReactQueryProvider
└── utils/                  # api/, hasPermission
```

**Schemas Zod ficam em `features/[domain]/schemas/`** e devem ser idênticos ao schema do backend (`apps/backend/src/features/[domain]/[domain].schema.ts`). Atualize ambos lados ao mudar um schema.

---

## Regras de código

### TypeScript
- `strict: true`. Proibido `any`.
- Tipagem explícita em funções públicas.

### Nomenclatura
| Tipo | Padrão |
|---|---|
| Componentes | PascalCase |
| Hooks | camelCase (`useX`) |
| Tipos/Interfaces | PascalCase |
| Constantes | UPPER_SNAKE_CASE |

### Imports
- Sempre path alias `@/` para `src/`.
- Schemas vêm de `../schemas/[domain].schema` (dentro da própria feature).
- Nunca `../../../`.

### Componentes
- Function components apenas.
- Preferir Gluestack UI; StyleSheet para estilos complexos.
- Pasta por componente: `ComponentName/index.tsx` + `ComponentName.styles.ts`.
- Barrel exports por feature e por pasta de componentes.

---

## API & estado

**Toda HTTP via React Query. Sem exceção.**

- `useAPIQuery` → GET
- `useAPIMutation` → POST/PUT/PATCH/DELETE
- `request()` de `@/utils/api/request` é o único caminho para chamar axios direto.
- `queryKey` obrigatório. `invalidateQueryKey` obrigatório em mutations que modificam estado servidor.
- Estado global apenas para sessão/tema. Dados de API ficam no React Query.

### Padrão de hook

```typescript
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { request } from '@/utils/api';
import type {
  Client,
  CreateClientInput,
  ListClientsQuery,
  ListClientsResponse,
} from '../schemas/clients.schema';

const QUERY_KEY = 'clients';

export function useClients(query?: ListClientsQuery) {
  return useAPIQuery<ListClientsResponse>({
    url: 'listClients',
    method: 'POST',
    queryKey: [QUERY_KEY, query],
    params: query,
  });
}
```

---

## Validação

- Schemas Zod locais espelham o backend. Ao mudar um schema, atualize **os dois lados**.
- Integração com React Hook Form via `zodResolver`.
- Mensagens em português.
- Nunca enviar dados sem validação.

---

## Autenticação e claims

- JWT em `expo-secure-store`. Nunca `AsyncStorage` ou estado.
- Sessão via `useAuth()` do `AuthProvider`.
- Permissões via `hasPermission(user, [KnownClaims.x])`.
- Rotas em `constants/routes/routes.private.ts` declaram `claims` obrigatórios.
- Nunca exibir ação sem checar permissão.

### Interceptors axios
- Request: injeta `Authorization: Bearer {token}` (skip rota `/auth`).
- Response: 401/403 limpa secure store e redireciona para login.

---

## Erros

- Sempre tratar erros de mutation.
- `getResponseError(error)` extrai mensagem.
- `handleFieldErrors(error, setError)` aplica erros de campo no form.
- `console.log` proibido. Use `console.warn` / `console.error`.

---

## Rotas (Expo Router)

- `app/(auth)/` rotas públicas, `app/(private)/` rotas protegidas com layout que checa sessão.
- `index.tsx` para páginas, `_layout.tsx` para layouts compartilhados.
- Toda rota nova entra em `constants/routes/` com `path`, `name`, `icon?`, `claims?`.

---

## Anti-padrões (proibido)

- ❌ Schema Zod fora de `features/[domain]/schemas/`
- ❌ Schema divergente do backend sem justificativa
- ❌ Axios direto em componente
- ❌ Lógica de negócio em `components/` global
- ❌ Estado global para dados de API
- ❌ Validação só no cliente
- ❌ Imports relativos longos
- ❌ Hardcode de strings/cores/rotas
- ❌ Componentes > 200 linhas (quebrar)

---

## Variáveis de ambiente

```env
EXPO_PUBLIC_API_URL=...
EXPO_PUBLIC_APP_NAME=...
EXPO_PUBLIC_APP_LANGUAGE=pt-BR
```

`EXPO_PUBLIC_*` é exposto ao cliente. **Nunca** colocar token/secret aqui.

---

## Sensores (gate de "pronto")

```bash
npm run sensor   # typecheck + lint
```

Falha em qualquer um = task não está pronta.
