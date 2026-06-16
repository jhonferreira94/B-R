import { z } from 'zod';
import { BaseEntitySchema, PaginationSchema } from '@/utils/api/common-schemas';

export const GaugeSchema = BaseEntitySchema.extend({
  awg: z.string().min(1, 'AWG é obrigatório'),
  mm2: z.number().min(0.01, 'Deve ser maior que 0'),
});

export type Gauge = z.infer<typeof GaugeSchema>;

export const CreateGaugeSchema = z.object({
  awg: z.string().min(1, 'AWG é obrigatório'),
  mm2: z.coerce.number({ invalid_type_error: 'Valor numérico inválido' }).min(0.01, 'Deve ser maior que 0'),
});

export type CreateGaugeInput = z.infer<typeof CreateGaugeSchema>;

export const UpdateGaugeSchema = CreateGaugeSchema.partial();

export type UpdateGaugeInput = z.infer<typeof UpdateGaugeSchema>;

export const ListGaugesQuerySchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  search: z.string().optional(),
});

export type ListGaugesQuery = z.infer<typeof ListGaugesQuerySchema>;

export const ListGaugesResponseSchema = z.object({
  items: z.array(GaugeSchema),
  pagination: PaginationSchema,
});

export type ListGaugesResponse = z.infer<typeof ListGaugesResponseSchema>;

export const OkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;
