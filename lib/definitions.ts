import { z } from 'zod';

// --- INVOICES (Facturas) ---
export const InvoiceSchema = z.object({
  id: z.string(),
  user_id: z.string().uuid().optional(),
  client_id: z.string().uuid({
    message: 'Debes seleccionar un cliente.',
  }),
  invoice_number: z.number(),
  amount: z.coerce.number(),
  currency: z.string().default('ARS'),
  discount: z.coerce.number().min(0).max(100).default(0),
  status: z.enum(['pendiente', 'facturado', 'vencido']),
  issue_date: z.date({
    message: 'La fecha de emisión es requerida.',
  }),
  due_date: z.date({
    message: 'La fecha de vencimiento es requerida.',
  }),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

// --- CLIENTS (Clientes) ---
export const ClientSchema = z.object({
  id: z.string(),
  user_id: z.string().uuid().optional(),
  name: z.string({
    message: 'El nombre del cliente es requerido.',
  }).min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().email({
    message: 'Por favor, introduce un email válido.',
  }).optional().or(z.literal('')),
  brand: z.string().optional(),
  phone: z.string().optional(),
  image_url: z.string().optional(),
});

export type Client = z.infer<typeof ClientSchema>;

// --- LINE ITEMS (Ítems de Factura) ---
export const LineItemSchema = z.object({
  id: z.string(),
  invoice_id: z.string(),
  description: z.string().min(1, { message: 'La descripción es requerida.' }),
  quantity: z.coerce.number().gt(0, { message: 'La cantidad debe ser mayor a 0.' }),
  unit_price: z.coerce.number().positive({ message: 'El precio debe ser un número positivo.' }),
});

export type LineItem = z.infer<typeof LineItemSchema>;

// --- CONSTANTES DE CONFIGURACIÓN Y UI ---
export const ENTITY_TYPES = ['personal', 'business'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const PAYMENT_METHODS = ['cash', 'debit_card', 'credit_card', 'transfer'] as const;
export const EXPENSE_STATUS = ['paid', 'pending', 'overdue'] as const;
export const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const;

// 1. EXPENSE TEMPLATES (Plantillas Recurrentes)
export const ExpenseTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  concept: z.string().min(1, "El concepto es requerido."),
  amount: z.coerce.number().positive("El monto debe ser positivo."),
  currency: z.string().default('ARS'),
  category_id: z.string().uuid("Categoría requerida."),
  vendor_id: z.string().uuid().nullable().optional(),
  entity_type: z.enum(ENTITY_TYPES).default('personal'),
  frequency: z.enum(FREQUENCIES),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable().optional(),
  next_due_date: z.coerce.date(),
  payment_method: z.enum(PAYMENT_METHODS),
  card_id: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});
export type ExpenseTemplate = z.infer<typeof ExpenseTemplateSchema>;

// 2. EXPENSES (Instancias Reales)
export const ExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  template_id: z.string().uuid().nullable().optional(),
  concept: z.string().min(1, "El concepto es requerido."),
  amount: z.coerce.number().positive("El monto debe ser positivo."),
  currency: z.string().default('ARS'),
  category_id: z.string().uuid("Categoría requerida."),
  vendor_id: z.string().uuid().nullable().optional(),
  entity_type: z.enum(ENTITY_TYPES).default('personal'),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM requerido').optional().nullable(),
  status: z.enum(EXPENSE_STATUS).default('pending'),
  date: z.coerce.date({ message: "Fecha requerida." }),
  payment_method: z.enum(PAYMENT_METHODS),
  card_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

// 3. EXPENSE INSTALLMENTS (Cuotas legacy)
export const ExpenseInstallmentSchema = z.object({
  id: z.string().uuid().optional(),
  expense_id: z.string().uuid(),
  installment_number: z.coerce.number().int().min(1),
  total_installments: z.coerce.number().int().min(1),
  due_date: z.coerce.date(),
  amount: z.coerce.number().int().positive(),
  status: z.enum(EXPENSE_STATUS).default('pending'),
});
export type ExpenseInstallment = z.infer<typeof ExpenseInstallmentSchema>;

// --- CARDS (Tarjetas) ---
export const CardSchema = z.object({
  id: z.string(),
  user_id: z.string().uuid().optional(),
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  last_four_digits: z.string().length(4, { message: 'Deben ser 4 dígitos.' }).optional().nullable(),
  closing_day: z.coerce.number().min(1).max(31, { message: 'Día inválido.' }),
  due_day: z.coerce.number().min(1).max(31, { message: 'Día inválido.' }),
  color: z.string().optional().default('slate'),
});
export type Card = z.infer<typeof CardSchema>;

export type CardWithStatement = {
  id: string;
  name: string;
  last_four_digits: string | null;
  closing_day: number;
  due_day: number;
  color: string;
  statement: {
    id: string;
    totalAmount: number;
    paidAmount?: number;
    dueDate: Date;
    status: 'pending' | 'partially_paid' | 'paid';
  } | null;
};

// --- VENDORS (Proveedores) ---
export const VendorSchema = z.object({
  id: z.string(),
  name: z.string({ message: 'El nombre del proveedor es requerido.' }),
});
export type Vendor = z.infer<typeof VendorSchema>;

export type Category = {
  id: string;
  name: string;
};

// --- TIPOS EXTENDIDOS PARA UI ---
export type ExpenseWithVendor = Expense & {
  vendor_name: string | null;
  category_name: string;
  entity_type: EntityType;
  period?: string | null;
  total_installments?: number;
  current_installment?: number;
  transaction_date?: Date;
};

export type ExpenseTemplateWithDetails = ExpenseTemplate & {
  vendor_name: string | null;
  category_name: string;
};

export type InvoiceWithClient = {
  id: string;
  amount: number;
  currency?: string;
  issue_date: Date;
  due_date: Date;
  status: 'pendiente' | 'facturado' | 'vencido';
  name: string;
  email: string | null;
  brand: string | null;
  phone: string | null;
  image_url: string | null | undefined;
};

export type FullInvoice = Invoice & {
  client: Client;
  line_items: LineItem[];
};

export type ClientWithStats = {
  id: string;
  name: string;
  brand: string;
  email: string | null;
  phone: string | null;
  total_invoices: number;
  total_revenue: number;
  total_billed: number;
  pending_amount: number;
  overdue_amount: number;
  overdue_invoices: number;
  pending_invoices: number;
  paid_invoices?: number;
  last_invoice_date?: Date | null;
  image_url: string | null;
};

// --- FORM STATES ---
export type ExpenseState = {
  errors?: {
    concept?: string[];
    amount?: string[];
    category_id?: string[];
    vendor_id?: string[];
    date?: string[];
    payment_method?: string[];
    status?: string[];
    entity_type?: string[];
    frequency?: string[];
    start_date?: string[];
    category?: string[];
    expenseDate?: string[];
  };
  message?: string | null;
};

export type InvoiceState = {
  errors?: {
    client_id?: string[];
    issue_date?: string[];
    due_date?: string[];
    status?: string[];
    line_items?: string[];
    discount?: string[];
  };
  message?: string | null;
};

export type ClientState = {
  errors?: {
    name?: string[];
    email?: string[];
    brand?: string[];
    phone?: string[];
  };
  message?: string | null;
};

export type VendorState = {
  errors?: {
    name?: string[];
  };
  message?: string | null;
};

export type CardState = {
  errors?: {
    name?: string[];
    last_four_digits?: string[];
    closing_day?: string[];
    due_day?: string[];
  };
  message?: string | null;
};

// --- AGENDA LOGIC ---
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: Date;
  end_time: Date;
  is_all_day: boolean;
  type: 'meeting' | 'task' | 'reminder';
  status: 'pending' | 'completed' | 'cancelled';
  priority?: EventPriority;
  related_client_id: string | null;
  related_invoice_id: string | null;
  client_name?: string | null;
  client_image_url?: string | null;
  created_at: Date;
};

export type CalendarEventCreate = Omit<CalendarEvent, 'id' | 'created_at'>;

export const CalendarEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  is_all_day: z.boolean().default(false),
  type: z.enum(['meeting', 'task', 'reminder']),
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  related_client_id: z.string().uuid().optional().nullable(),
  related_invoice_id: z.string().uuid().optional().nullable(),
});

export type CalendarEventFormState = {
  errors?: {
    title?: string[];
    start_time?: string[];
    end_time?: string[];
    type?: string[];
    status?: string[];
  };
  message?: string | null;
};



export type AccountType = 'bank' | 'wallet' | 'cash' | 'usd_account';

export interface BankAccount {
  id: string;
  user_id?: string;
  name: string;
  account_type: AccountType;
  currency: 'ARS' | 'USD';
  balance: number; // En pesos o dólares reales (dividido por 100 en lectura)
  color: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type PredictiveExpenseStatus = {
  type: 'card' | 'recurring';
  statementId?: string;
  cardName?: string;
  cardId?: string;
  date: Date;
  amount: number;
  label: string;
} | null;

export type PredictiveInvoiceStatus = {
  id?: string;
  count?: number;
  client?: string;
  currency?: 'ARS' | 'USD';
  date?: Date;
  amount: number;
  isOverdue: boolean;
} | null;

export type PredictiveAgendaStatus = {
  count: number;
  nextEvent: { title: string; date: Date } | null;
} | null;

export type DashboardPredictiveStatus = {
  expenses: PredictiveExpenseStatus;
  invoices: PredictiveInvoiceStatus;
  agenda: PredictiveAgendaStatus;
};
