
import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().optional(), // Firestore ID
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "E-mail inválido." }),
  role: UserRoleSchema.default('user'),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }).optional(),
  confirmPassword: z.string().optional(),
  createdAt: z.any().optional(), // Can be Date or Firestore Timestamp
  updatedAt: z.any().optional(), // Can be Date or Firestore Timestamp
}).refine(data => {
  // Se a senha for fornecida, a confirmação também deve ser e elas devem coincidir.
  // Se a senha não for fornecida (ex: na edição), não aplicamos esta validação.
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"], // Indica qual campo mostrará o erro
});

export type User = z.infer<typeof UserSchema>;
