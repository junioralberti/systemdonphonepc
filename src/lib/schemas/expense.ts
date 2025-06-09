
import { z } from 'zod';

export const expenseCategories = [
  "Aluguel",
  "Internet",
  "Energia",
  "Água",
  "Compras", // Supermercado, insumos para a loja, etc.
  "Salários", // Pagamento de funcionários
  "Impostos", // DARF, DAS, INSS, FGTS, etc.
  "Transporte", // Combustível, passagens, manutenção de veículo da empresa
  "Serviços de Terceiros", // Contador, marketing, consultoria, etc.
  "Manutenção e Reparos", // Do estabelecimento ou equipamentos
  "Material de Escritório",
  "Telefonia", // Contas de telefone fixo/móvel da empresa
  "Software e Assinaturas", // Licenças de software, serviços online
  "Marketing e Publicidade",
  "Taxas Bancárias",
  "Outros", // Despesas diversas não classificadas
] as const;

export type ExpenseCategory = typeof expenseCategories[number];

export const ExpenseStatusSchema = z.enum(["Pendente", "Pago"]);
export type ExpenseStatus = z.infer<typeof ExpenseStatusSchema>;

export const ExpenseSchema = z.object({
  id: z.string().optional(), // Firestore ID
  title: z.string().min(2, { message: "O título da despesa deve ter pelo menos 2 caracteres." }),
  amount: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
    z.number({ invalid_type_error: "O valor deve ser um número." }).positive({ message: "O valor deve ser positivo." })
  ),
  dueDate: z.date({ required_error: "A data de vencimento é obrigatória.", invalid_type_error: "Data de vencimento inválida."}),
  category: z.enum(expenseCategories, { required_error: "A categoria é obrigatória." }),
  status: ExpenseStatusSchema.default("Pendente"),
  notes: z.string().optional().or(z.literal('')), // Campo opcional para observações
  paymentDate: z.date().optional().nullable(), // Data em que foi pago, se status for "Pago"
  createdAt: z.any().optional(), // Firestore Timestamp or Date
  updatedAt: z.any().optional(), // Firestore Timestamp or Date
});

export type Expense = z.infer<typeof ExpenseSchema>;

// Schema for the form, handling date as string initially
export const ExpenseFormSchema = ExpenseSchema.extend({
  dueDate: z.string().min(1, "A data de vencimento é obrigatória."), // String for form input
  paymentDate: z.string().optional().nullable(), // String for form input
});

export type ExpenseFormData = z.infer<typeof ExpenseFormSchema>;

