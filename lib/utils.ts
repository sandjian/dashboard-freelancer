import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const formatCurrency = (amount: number, currency = 'ARS') => {
  // 👇 CORRECCIÓN: Le decimos a TypeScript que este objeto es de tipo Intl.NumberFormatOptions
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'ARS' ? 0 : 2,
    maximumFractionDigits: currency === 'ARS' ? 0 : 2,
  };

  const locale = currency === 'USD' ? 'en-US' : 'es-AR';

  return new Intl.NumberFormat(locale, options).format(amount);
};




export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

/**
 * Calcula la fecha de vencimiento y cierre basada en la fecha de la transacción
 * y los parámetros de la tarjeta.
 */
export function calculateCardDates(
  transactionDate: Date,
  closingDay: number,
  dueDay: number
) {
  // 1. Determinar la fecha de cierre para el mes de la transacción
  const closeDateThisMonth = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), closingDay);

  let statementMonth = transactionDate.getMonth();
  let statementYear = transactionDate.getFullYear();

  // Si la transacción fue DESPUÉS del cierre, entra en el siguiente resumen
  if (transactionDate > closeDateThisMonth) {
    statementMonth++;
    if (statementMonth > 11) {
      statementMonth = 0;
      statementYear++;
    }
  }

  // 2. Calcular la fecha de vencimiento (pago)
  // Generalmente es en el mes SIGUIENTE al del resumen administrativo
  // Ejemplo: Cierra 25 Ene (incluye compras hasta 25 Ene). Vence 5 Feb.
  // Ejemplo: Cierra 25 Ene. Compro 26 Ene. Entra en Cierre 25 Feb. Vence 5 Marzo.

  // Si dueDay < closingDay, asumo que vence al mes siguiente del cierre.
  // Si close=25, due=5. Cierre Ener -> Vencimiento Feb.

  let dueMonth = statementMonth + 1;
  let dueYear = statementYear;

  if (dueMonth > 11) {
    dueMonth = 0;
    dueYear++;
  }

  const dueDate = new Date(dueYear, dueMonth, dueDay);

  return {
    statementMonth, // El mes "administrativo" del resumen (0-indexed)
    statementYear,
    dueDate
  };
}

export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}