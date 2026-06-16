import { z } from 'zod';
import { BaseEntitySchema, PaginationSchema } from '@/utils/api/common-schemas';

export const TerminalTypeSchema = z.enum([
  'pino',
  'femea',
  'olhal',
  'pino_macho',
  'faston',
  'outro'
]);

export type TerminalType = z.infer<typeof TerminalTypeSchema>;

export const TerminalSchema = BaseEntitySchema.extend({
  pn: z
    .string()
    .min(1, 'PN (Part Number) é obrigatório')
    .toUpperCase(),
  supplier: z.string().min(2, 'Fornecedor é obrigatório'),
  type: TerminalTypeSchema,
});

export type Terminal = z.infer<typeof TerminalSchema>;

export const CreateTerminalSchema = z.object({
  pn: z
    .string()
    .min(1, 'PN (Part Number) é obrigatório')
    .toUpperCase(),
  supplier: z.string().min(2, 'Fornecedor é obrigatório'),
  type: TerminalTypeSchema,
});

export type CreateTerminalInput = z.infer<typeof CreateTerminalSchema>;

export const UpdateTerminalSchema = CreateTerminalSchema.partial();

export type UpdateTerminalInput = z.infer<typeof UpdateTerminalSchema>;

export const ListTerminalsQuerySchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  search: z.string().optional(),
  type: TerminalTypeSchema.optional(),
});

export type ListTerminalsQuery = z.infer<typeof ListTerminalsQuerySchema>;

export const ListTerminalsResponseSchema = z.object({
  items: z.array(TerminalSchema),
  pagination: PaginationSchema,
});

export type ListTerminalsResponse = z.infer<typeof ListTerminalsResponseSchema>;

export const OkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;
