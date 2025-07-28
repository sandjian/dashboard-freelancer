import { z } from "zod";

export const EarningSchema = z.object({
  id: z.string(), 
  concept: z.string().min(3, { message: "El concepto debe tener al menos 3 caracteres." }),
  client: z.string().min(1, { message: "Debes seleccionar un cliente." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser un número positivo." }),
  currency: z.string().default('ARS'),
  status: z.enum(['Facturado', 'Por cobrar']),
  dueDate: z.date({ message: "La fecha estimada es requerida."}),
});

export type Earning = z.infer<typeof EarningSchema>;


export type EarningState = {
  errors?: {
    concept?: string[];
    client?: string[];
    amount?: string[];
    status?: string[];
    currency?:string[];
    dueDate?: string[];
  };
  message?: string | null;
};


export const ExpensesSchema = z.object({
  id: z.string(), 
  concept: z.string().min(3, { message: "El concepto debe tener al menos 3 caracteres." }),
  category: z.string().min(1, { message: "Debes seleccionar una categoria." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser un número positivo." }),
  expenseDate: z.date({ message: "La fecha estimada es requerida."}),
});

export type Expenses = z.infer<typeof ExpensesSchema>;


export type ExpensesState = {
  errors?: {
    concept?: string[];
    category?: string[];
    amount?: string[];
    expenseDate?: string[];
  };
  message?: string | null;
};


export type MonthlyRevenueData = {
  month: string;
  earnings: number;
  expenses: number;
};





// --- RECURRING TRANSACTIONS (TRANSACCIONES RECURRENTES) ---
export const RecurringTransactionSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(), // Puede ser nulo por ahora
  type: z.enum(['earning', 'expense']),
  concept: z.string().min(3, { message: 'El concepto es requerido.' }),
  category: z.string().optional().nullable(),
  client: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  amount: z.coerce.number().positive({ message: 'El monto debe ser positivo.' }),
  dayOfMonth: z.coerce.number().min(1).max(31, { message: 'Día inválido.' }),
  isActive: z.boolean(),
});
export type RecurringTransaction = z.infer<typeof RecurringTransactionSchema>;
export type RecurringTransactionState = {
  errors?: {
    type?: string[];
    concept?: string[];
    category?: string[];
    client?: string[]; // 👈 AÑADE ESTA LÍNEA
    amount?: string[];
    currency?: string[]; // 👈 AÑADE ESTA TAMBIÉN (para el futuro)
    dayOfMonth?: string[];
  };
  message?: string | null;
};

// Definimos la forma de los datos que esperamos
export type ChartData = {
  client: string;
  total: number;
};