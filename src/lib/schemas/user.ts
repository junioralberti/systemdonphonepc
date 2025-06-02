
import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().optional(), // Firestore ID
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "E-mail inválido." }),
  role: UserRoleSchema.default('user'),
  createdAt: z.any().optional(), // Can be Date or Firestore Timestamp
  updatedAt: z.any().optional(), // Can be Date or Firestore Timestamp
});

export type User = z.infer<typeof UserSchema>;
