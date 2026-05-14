import type { SessionUser } from '@/providers/AuthProvider';

export function hasPermission(user: SessionUser | null | undefined, required: string[]): boolean {
  if (!user) return false;
  const claims = Array.isArray(user.Claims)
    ? user.Claims
    : typeof user.Claims === 'string'
      ? [user.Claims]
      : [];
  return required.every((c) => claims.includes(c));
}
