import { z } from 'zod';
import { BaseEntitySchema, PaginationSchema } from '@/utils/api/common-schemas';

export const ApplicatorSchema = BaseEntitySchema.extend({
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hifens'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional().nullable(),
  maintenanceCycles: z.number().min(1, 'Deve ser maior que 0').int('Deve ser um número inteiro'),
});

export type Applicator = z.infer<typeof ApplicatorSchema>;

export const CreateApplicatorSchema = z.object({
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hifens'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional().nullable(),
  maintenanceCycles: z.coerce.number().min(1, 'Deve ser maior que 0').int('Deve ser um número inteiro'),
});

export type CreateApplicatorInput = z.infer<typeof CreateApplicatorSchema>;

export const UpdateApplicatorSchema = CreateApplicatorSchema.partial();

export type UpdateApplicatorInput = z.infer<typeof UpdateApplicatorSchema>;

export const ListApplicatorsQuerySchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  search: z.string().optional(),
});

export type ListApplicatorsQuery = z.infer<typeof ListApplicatorsQuerySchema>;

export const ListApplicatorsResponseSchema = z.object({
  items: z.array(ApplicatorSchema),
  pagination: PaginationSchema,
});

export type ListApplicatorsResponse = z.infer<typeof ListApplicatorsResponseSchema>;

export const OkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;
