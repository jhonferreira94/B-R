import { z } from 'zod';

function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  for (const factor of [10, 11]) {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) sum += Number(digits[i]) * (factor - i);
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(digits[factor - 1])) return false;
  }
  return true;
}

export const SignInSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(1, { message: 'Senha obrigatória' }),
});

export type SignInFormData = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    name: z.string().min(1, { message: 'Nome obrigatório' }),
    cpf: z.string().refine(isValidCpf, { message: 'CPF inválido' }),
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
