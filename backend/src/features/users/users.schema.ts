import { z } from 'zod';

export const UserRole = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRole>;

export const UserSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRole,
  claims: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const ALL_CLIENT_CLAIMS = [
  'list_clients',
  'create_clients',
  'update_clients',
  'delete_clients',
] as const;
