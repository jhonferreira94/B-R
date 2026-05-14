import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(1, { message: 'Senha obrigatória' }),
});

export type SignInFormData = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    name: z.string().min(1, { message: 'Nome obrigatório' }),
    cpf: z.string().min(14, { message: 'CPF inválido' }),
    email: z.string().email({ message: 'E-mail inválido' }),
    password: z.string().min(8, { message: 'Mínimo de 8 caracteres' }),
    confirmPassword: z.string().min(1, { message: 'Confirme a senha' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  });

export type SignUpFormData = z.infer<typeof SignUpSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
});

export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
