// En /app/lib/actions.ts
"use server"; 

import { revalidatePath } from "next/cache";
import { EarningSchema, EarningState } from "./definitions";
import { redirect } from "next/navigation";

// Usamos .omit({ id: true }) porque no esperamos que el cliente nos envíe un id
const CreateEarning = EarningSchema.omit({ id: true });

export async function createEarning(prevState: EarningState, formData: FormData) {
  // 1. Validar los datos usando Zod
  const validatedFields = CreateEarning.safeParse({
    concept: formData.get('concept'),
    client: formData.get('client'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    dueDate: new Date(formData.get('dueDate') as string),
  });

  // Si la validación falla, podemos devolver errores (lo veremos después)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se pudo crear el ingreso.',
    };
  }

  // 2. Por ahora, solo mostraremos los datos validados en la consola del servidor
  console.log('Datos recibidos y validados en el servidor:');
  console.log(validatedFields.data);

  // 3. Más adelante, aquí irá la lógica para insertar en la base de datos

  // 4. También la lógica para revalidar la caché de la página y que se actualice la tabla
  revalidatePath('/dashboard/earnings');
  redirect('/dashboard/earnings');
}

