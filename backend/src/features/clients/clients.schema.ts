import { z } from 'zod';

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  document: z
    .string()
    .min(11, { message: 'Documento inválido' })
    .max(14, { message: 'Documento inválido' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  createdBy: z.string(),
});

export const CreateClientSchema = ClientSchema.omit({
  id: true,
  createdAt: true,
  createdBy: true,
  isActive: true,
});

export const UpdateClientSchema = CreateClientSchema.partial();

export const ListClientsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  isActive: z.coerce.boolean().optional(),
});

export const PaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  pageCount: z.number(),
  isFirstPage: z.boolean(),
  isLastPage: z.boolean(),
});

export const ListClientsResponseSchema = z.object({
  items: z.array(ClientSchema),
  pagination: PaginationSchema,
});

export type Client = z.infer<typeof ClientSchema>;
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ListClientsQuery = z.infer<typeof ListClientsQuerySchema>;
export type ListClientsResponse = z.infer<typeof ListClientsResponseSchema>;
