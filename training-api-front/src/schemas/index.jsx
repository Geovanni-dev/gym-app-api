import { z } from 'zod'; // importa a biblioteca zod para validação de dados

// Schema para login de usuários
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

// Schema para registro de usuários
export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

//schema para verificação de código de redefinição de senha
export const verifySchema = z.object({
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});

// schema para solicitação de redefinição de senha
export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

// Schema para redefinição de senha
export const resetPasswordSchema = z.object({
  code: z.string().length(6, "Código inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Mínimo 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve ter 6+ caracteres"),
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "A nova senha deve ser diferente da atual",
  path: ["newPassword"],
});

// Schema para criação de planos de treino
export const planSchema = z.object({
  name: z.string().min(1, "O nome do plano é obrigatório"),
  days: z.array(z.object({
    name: z.string().min(1, "O nome do dia é obrigatório"),
    exercises: z.array(z.object({
      name: z.string().min(1, "O nome do exercício é obrigatório"),
      sets: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(1, "Mínimo 1 série")),
      reps: z.string().min(1, "Reps obrigatórias"),
      weight: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0, "Peso deve ser positivo"))
    }))
  }))
});

//// Schema para geração de treinos
export const generateWorkoutSchema = z.object({
  goal: z.enum(["forca", "resistencia", "hipertrofia"]),
  days: z.preprocess((val) => Number(val), z.number().min(2, "Mínimo 2 dias").max(6, "Máximo 6 dias")),
});