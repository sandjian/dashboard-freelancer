import { z } from 'zod';


// --- INVOICES (Facturas) ---
export const InvoiceSchema = z.object({
  id: z.string(),
  client_id: z.string().uuid({
    message: 'Debes seleccionar un cliente.',
  }),
  invoice_number: z.number(),
  amount: z.coerce.number(), // El total se calculará, así que no necesita validación estricta aquí
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
  name: z.string({
    message: 'El nombre del cliente es requerido.',
  }).min(3, { message: 'El nombre debe tener al menos 3 caracteres.'}),
  
  email: z.string().email({
    message: 'Por favor, introduce un email válido.',
  }).optional().or(z.literal('')), // Permite que el campo sea opcional o un string vacío

  brand: z.string().optional(),
  phone: z.string().optional(),

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

// --- TIPOS DE ESTADO PARA FORMULARIOS ---

// Estado para el formulario de creación de facturas
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

export type InvoiceWithClient = {
  id: string;
  amount: number;
  issue_date: Date;
  due_date: Date;
  status: 'pendiente' | 'facturado' | 'vencido';
  // Datos del cliente
  name: string;
  email: string | null;
  brand: string | null;
  phone: string | null;
};

export type FullInvoice = Invoice & {
    client: Client;
    line_items: LineItem[];
};



// --- EXPENSES (Gastos) - NUEVA ESTRUCTURA ---
export const ExpenseSchema = z.object({
  id: z.string().optional(),
  vendor_id: z.string().nullable().optional(),
  concept: z.string().min(1, { message: "El concepto es requerido." }),
  category_id: z.string().min(1, { message: "Debes seleccionar una categoria." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser un número positivo." }),
  currency: z.string().default('ARS'),
  status: z.enum(['pagado', 'pendiente']).default('pagado'),
  transactionDate: z.coerce.date({ message: "La fecha de la transacción es requerida." }),
  payment_method: z.string().min(1, { message: "El método de pago es requerido."}),
  card_id: z.string().nullable().optional(),
  
  is_recurring: z.coerce.boolean().default(false),
  recurrence_interval: z.enum(['monthly', 'yearly', 'none']).nullable().optional(),
  recurrence_end_date: z.coerce.date().nullable().optional(),
  parent_expense_id: z.string().uuid().nullable().optional(),
  
  total_installments: z.coerce.number().min(1).default(1),
  current_installment: z.coerce.number().min(1).default(1),
});
export type Expense = z.infer<typeof ExpenseSchema>;




// --- CARDS (Tarjetas) - NUEVO ---
export const CardSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  last_four_digits: z.string().length(4, { message: 'Deben ser 4 dígitos.' }).optional().nullable(),
  closing_day: z.coerce.number().min(1).max(31, { message: 'Día inválido.' }),
  due_day: z.coerce.number().min(1).max(31, { message: 'Día inválido.' }),
});
export type Card = z.infer<typeof CardSchema>;





// --- VENDORS (Proveedores) ---
export const VendorSchema = z.object({
  id: z.string(),
  name: z.string({ message: 'El nombre del proveedor es requerido.' }),
});
export type Vendor = z.infer<typeof VendorSchema>;







export type ExpenseState = {
  errors?: {
    vendor_id?: string[];
    concept?: string[];
    category_id?: string[];
    amount?: string[];
    status?: string[];
    transactionDate?: string[];
    expenseDate?: string[];
    payment_method?: string[];
    total_installments?: string[];
    // 👇 AGREGAR ESTOS NUEVOS CAMPOS
    recurrence_interval?: string[];
    recurrence_end_date?: string[];
    is_recurring?: string[];
  };
  message?: string | null;
};

export type Category = {
  id: string;
  name: string;
};

export type ExpenseWithVendor = {
  id: string;
  concept: string;
  amount: number;
  currency: string;
  status: string;
  expense_date: string;
  payment_method: string;
  total_installments: number;
  current_installment: number;
  is_recurring: boolean;
  category_id: string;
  vendor_name: string | null;
  category_name: string;
  expense_type: string; // 'one_time' | 'recurring_generated' | 'recurring_original' | 'installment'
  parent_expense_id: string | null;
  transaction_date: string;
  recurrence_interval?: string | null;
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

export type ClientWithStats = {
  id: string;
  name: string;
  brand:string
  email: string | null;
  phone:string | null;
  total_invoices: number;
};