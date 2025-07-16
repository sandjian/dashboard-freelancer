import { z } from "zod";

export const EarningSchema = z.object({
  id: z.string(), // El id lo generará la base de datos
  concept: z.string().min(3, { message: "El concepto debe tener al menos 3 caracteres." }),
  client: z.string().min(1, { message: "Debes seleccionar un cliente." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser un número positivo." }),
  status: z.enum(['Pagado', 'Facturado', 'Atrasado'], { message: "Estado inválido."}),
  dueDate: z.date({ message: "La fecha de vencimiento es requerida."}),
});



export type Earning = {
  id: string;
  concept: string;
  client: string;
  amount: number;
  status: 'Pagado' | 'Facturado' | 'Atrasado';
  dueDate: string; // Formato 'YYYY-MM-DD'
};

export type EarningState = {
  errors?: {
    concept?: string[];
    client?: string[];
    amount?: string[];
    status?: string[];
    dueDate?: string[];
  };
  message?: string | null;
};