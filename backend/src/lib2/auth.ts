import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

export interface AuthContext {
  uid: string;
  email?: string;
  claims: Record<string, unknown>;
}

export function requireAuth(request: CallableRequest): AuthContext {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Autenticação obrigatória');
  }
  return {
    uid: request.auth.uid,
    email: request.auth.token.email,
    claims: (request.auth.token as Record<string, unknown>) ?? {},
  };
}

export function requireClaims(request: CallableRequest, required: string[]): AuthContext {
  const auth = requireAuth(request);
  const userClaims = Array.isArray(auth.claims.claims)
    ? (auth.claims.claims as string[])
    : typeof auth.claims.claims === 'string'
      ? [auth.claims.claims]
      : [];
  const missing = required.filter((c) => !userClaims.includes(c));
  if (missing.length > 0) {
    throw new HttpsError('permission-denied', `Permissão insuficiente: ${missing.join(', ')}`);
  }
  return auth;
}
