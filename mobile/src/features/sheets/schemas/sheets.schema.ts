import { z } from 'zod';
import { BaseEntitySchema, PaginationSchema } from '@/utils/api/common-schemas';
import { ApplicatorSchema } from '../applicators/schemas/applicators.schema';
import { GaugeSchema } from '../gauges/schemas/gauges.schema';
import { TerminalSchema } from '../terminals/schemas/terminals.schema';

export const SheetSchema = BaseEntitySchema.extend({
  applicatorId: z.string().min(1, 'Aplicador é obrigatório'),
  gaugeId: z.string().min(1, 'Bitola é obrigatória'),
  terminalId: z.string().min(1, 'Terminal é obrigatório'),
  
  cch: z.number().min(0, 'Deve ser maior que 0'),
  cch_min: z.number().min(0, 'Deve ser maior que 0'),
  cch_max: z.number().min(0, 'Deve ser maior que 0'),
  
  cca: z.number().min(0, 'Deve ser maior que 0'),
  cca_min: z.number().min(0, 'Deve ser maior que 0'),
  cca_max: z.number().min(0, 'Deve ser maior que 0'),
  
  cah: z.number().min(0, 'Deve ser maior que 0'),
  cah_min: z.number().min(0, 'Deve ser maior que 0'),
  cah_max: z.number().min(0, 'Deve ser maior que 0'),
  
  caa: z.number().min(0, 'Deve ser maior que 0'),
  caa_min: z.number().min(0, 'Deve ser maior que 0'),
  caa_max: z.number().min(0, 'Deve ser maior que 0'),
  
  traction: z.number().min(0, 'Tração mínima é obrigatória'),
  observation: z.string().optional().nullable(),

  // Relacionamentos para a listagem (opcionais no schema puro, mas esperados no response)
  applicator: ApplicatorSchema.optional(),
  gauge: GaugeSchema.optional(),
  terminal: TerminalSchema.optional(),
});

export type Sheet = z.infer<typeof SheetSchema>;

export const CreateSheetSchema = z.object({
  applicatorId: z.string().min(1, 'Aplicador é obrigatório'),
  gaugeId: z.string().min(1, 'Bitola é obrigatória'),
  terminalId: z.string().min(1, 'Terminal é obrigatório'),
  
  cch: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  cch_min: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  cch_max: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  
  cca: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  cca_min: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  cca_max: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  
  cah: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  cah_min: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  cah_max: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  
  caa: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  caa_min: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  caa_max: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01),
  
  traction: z.coerce.number({ invalid_type_error: 'Valor numérico inválido' }).min(1, 'A tração deve ser maior que 0'),
  observation: z.string().optional().nullable(),
}).refine(data => data.cch_min <= data.cch_max, {
  message: "CCH Min não pode ser maior que CCH Max",
  path: ["cch_max"],
}).refine(data => data.cca_min <= data.cca_max, {
  message: "CCA Min não pode ser maior que CCA Max",
  path: ["cca_max"],
}).refine(data => data.cah_min <= data.cah_max, {
  message: "CAH Min não pode ser maior que CAH Max",
  path: ["cah_max"],
}).refine(data => data.caa_min <= data.caa_max, {
  message: "CAA Min não pode ser maior que CAA Max",
  path: ["caa_max"],
});

export type CreateSheetInput = z.infer<typeof CreateSheetSchema>;

export const UpdateSheetSchema = CreateSheetSchema.partial();

export type UpdateSheetInput = z.infer<typeof UpdateSheetSchema>;

export const ListSheetsQuerySchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  search: z.string().optional(),
});

export type ListSheetsQuery = z.infer<typeof ListSheetsQuerySchema>;

export const ListSheetsResponseSchema = z.object({
  items: z.array(SheetSchema),
  pagination: PaginationSchema,
});

export type ListSheetsResponse = z.infer<typeof ListSheetsResponseSchema>;

export const OkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;
