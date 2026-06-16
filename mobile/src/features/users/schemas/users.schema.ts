import { z } from 'zod';
import { BaseEntitySchema, PaginationSchema } from '@/utils/api/common-schemas';

export const UserRoleSchema = z.enum(['admin', 'operator', 'consultant']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = BaseEntitySchema.extend({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  role: UserRoleSchema,
  jobTitle: z.string().min(1, 'Cargo é obrigatório'),
  dateOfBirth: z.string().min(10, 'Data de nascimento é obrigatória'), // YYYY-MM-DD
  legacyId: z.number().optional().nullable(),
  mustChangePassword: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  role: UserRoleSchema,
  jobTitle: z.string().min(1, 'Cargo é obrigatório'),
  dateOfBirth: z.string().min(10, 'Data de Nascimento é obrigatória'),
  legacyId: z.number().optional().nullable(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial().omit({ email: true });

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const ListUsersQuerySchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  search: z.string().optional(),
  role: UserRoleSchema.optional(),
});

export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;

export const ListUsersResponseSchema = z.object({
  items: z.array(UserSchema),
  pagination: PaginationSchema,
});

export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;

export const OkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;

export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
  newPassword: z.string(),
});

export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
