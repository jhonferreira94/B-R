# Sebrae Boilerplate — Ficha do Aplicativo

Monorepo com:

- **`mobile/`** — App Expo (React Native) + Expo Router + Gluestack UI + NativeWind + React Query + Firebase Web SDK
- **`backend/`** — Firebase Cloud Functions v2 (Callable, Node 20) + Firestore + Admin SDK

Auth, listagem de clientes e seed do admin já configurados.

---

## Pré-requisitos

- **Node.js 20** (`nvm install 20.18.0 && nvm use 20.18.0`)
- **npm** (vem com o Node)
- **Java 21+** no PATH (necessário para o emulator do Firestore/Auth)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Expo Go** no celular físico OU Android Studio/Xcode pra emulador
- Conta no Firebase com projeto criado e plano **Blaze** habilitado (Cloud Functions v2 exige Blaze)

---

## Setup do backend

```bash
cd backend
npm install
```

### Configurar o projeto Firebase

Edite `backend/.firebaserc` apontando para seu projeto:

```json
{ "projects": { "default": "SEU_PROJECT_ID" } }
```

Faça login e selecione:

```bash
firebase login
firebase use SEU_PROJECT_ID
```

No console do Firebase, habilite:

- **Authentication** → método **E-mail/senha**
- **Firestore Database** (modo nativo, região `southamerica-east1` recomendada)
- **Blaze plan** (necessário para Functions v2)

### Rodar o emulator local

```bash
npm run serve
```

Levanta Functions + Firestore + Auth. UI em http://127.0.0.1:4000.

> A primeira execução pode demorar; o script já injeta `FUNCTIONS_DISCOVERY_TIMEOUT=60` pra evitar timeout do analyzer.

### Deploy em produção

```bash
npm run deploy
```

### Criar o usuário admin (seed)

Com o backend deployado (ou rodando local), chame o callable `seedAdmin`. Ele cria `admin@sebrae.com` / `sebrae@123` no Auth e grava o usuário no Firestore com claims completas.

**Produção** (PowerShell):

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://southamerica-east1-SEU_PROJECT_ID.cloudfunctions.net/seedAdmin" `
  -ContentType "application/json" `
  -Body '{"data":{}}'
```

**Emulator**:

```powershell
Invoke-RestMethod -Method POST `
  -Uri "http://127.0.0.1:5001/SEU_PROJECT_ID/southamerica-east1/seedAdmin" `
  -ContentType "application/json" `
  -Body '{"data":{}}'
```

---

## Setup do mobile

```bash
cd mobile
npm install
```

### Variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp .env.example .env
```

Preencha com as credenciais do seu projeto Firebase (Console → Configurações do projeto → Apps Web):

```env
EXPO_PUBLIC_API_URL=https://southamerica-east1-SEU_PROJECT_ID.cloudfunctions.net
EXPO_PUBLIC_APP_NAME=Sebrae App
EXPO_PUBLIC_APP_LANGUAGE=pt-BR

EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=SEU_PROJECT_ID.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=SEU_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=SEU_PROJECT_ID.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...

EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1
```

#### Rodando contra o emulator local

Defina `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`. Se for celular físico, use o **IP da sua máquina na LAN** em `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST` (ex.: `192.168.0.10`) — `127.0.0.1` é o loopback do próprio celular.

```bash
ipconfig | findstr IPv4   # Windows
ifconfig | grep inet      # macOS/Linux
```

No Windows, libere as portas no firewall: `4000, 5001, 8080, 9099`.

### Iniciar o app

```bash
npm start
```

Escaneie o QR Code com o Expo Go (Android) ou Câmera (iOS). Para builds de simulador:

```bash
npm run android
npm run ios
```

### Login

Use o admin do seed: `admin@sebrae.com` / `sebrae@123`.

---

## Comandos úteis

| Onde      | Comando             | Faz                                  |
| --------- | ------------------- | ------------------------------------ |
| `backend` | `npm run serve`     | Emulator Functions + Firestore + Auth |
| `backend` | `npm run deploy`    | Deploy das functions                  |
| `backend` | `npm run logs`      | Tail dos logs em produção             |
| `backend` | `npm run sensor`    | Typecheck + lint                      |
| `mobile`  | `npm start`         | Expo dev server                       |
| `mobile`  | `npm run sensor`    | Typecheck + lint                      |

---

## Estrutura

```
backend/src/
  features/
    clients/        # CRUD + seed de clientes
    users/          # seedAdmin (cria admin com custom claims)
  lib/
    auth.ts         # requireAuth / requireClaims
    errors.ts       # AppError + handleError
    firestore.ts    # admin.initializeApp + db

mobile/src/
  app/              # Rotas Expo Router
    (auth)/         # login, signup, forgot-password
    (private)/      # rotas autenticadas (home, profile)
  features/
    auth/           # services, schemas, components
    clients/        # services (hooks React Query) + schemas
  providers/
    AuthProvider/   # onAuthStateChanged + sessão com claims
    ReactQueryProvider/
  configs/
    firebase/       # initializeApp, auth (RN persistence), functions
  utils/api/        # request() encapsulando httpsCallable
```

---

## Troubleshooting

- **`Cannot determine backend specification. Timeout after 10000`** — já mitigado por `FUNCTIONS_DISCOVERY_TIMEOUT=60` no `npm run serve`. Se persistir, aumente o valor.
- **`Could not spawn java -version`** — instale JDK 21 e adicione ao PATH: `C:\Program Files\Microsoft\jdk-21.x.x-hotspot\bin`.
- **Celular físico não conecta no emulator** — confirme mesma rede, use o IP LAN da máquina e libere portas no firewall.
- **`auth/email-already-in-use` no signup** — esperado se o e-mail já existe; faça login.
- **Login fica em loading** — verifique se o projeto Firebase do `.env` bate com o `firebase use` do backend.
- **"Não foi possível carregar os clientes"** — confirme que rodou `seedAdmin` e está logado com `admin@sebrae.com`.
