
import { z } from 'zod';

export const SaleStatusSchema = z.enum(["Concluída", "Cancelada"]).default("Concluída");
export type SaleStatus = z.infer<typeof SaleStatusSchema>;

// Tipos replicados de onde são usados ou inferidos
export type PaymentMethod = "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "PIX";

export const CartItemInputSchema = z.object({
  name: z.string(),
  quantity: z.number().min(1),
  price: z.number(), // No counter-sales, é price. Em OS é unitPrice. Usaremos 'price' para este contexto.
  // sku é usado internamente no front-end, mas não necessariamente salvo aqui, a menos que necessário para reestoque.
  // totalPrice é calculado no frontend para counter-sales e não é explicitamente parte do CartItemInput original
});
export type CartItemInput = z.infer<typeof CartItemInputSchema>;


export const SaleInputSchema = z.object({
  clientName: z.string().nullable(),
  items: z.array(CartItemInputSchema),
  paymentMethod: z.string().nullable().transform(val => val as PaymentMethod | null), // Cast to PaymentMethod type
  totalAmount: z.number(),
  status: SaleStatusSchema.optional(), // Será 'Concluída' por padrão ao criar
  cancellationReason: z.string().optional().nullable(),
  cancelledAt: z.any().optional().nullable(), // Firestore Timestamp or Date
});
export type SaleInput = z.infer<typeof SaleInputSchema>;


export const SaleSchema = SaleInputSchema.extend({
  id: z.string(), // Firestore ID
  createdAt: z.any(), // Firestore Timestamp or Date
});
export type Sale = z.infer<typeof SaleSchema>;
