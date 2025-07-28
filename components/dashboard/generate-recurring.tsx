'use client';

import { generateRecurringTransactions } from '@/lib/actions';
import type { RecurringTransaction } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export function GlobalAlert({
  pendingTransactions,
  year,
  month,
}: {
  pendingTransactions: RecurringTransaction[];
  year: number;
  month: number;
}) {
  const pendingCount = pendingTransactions.length;

  if (pendingCount === 0) {
    return null; // No muestra nada si no hay pendientes
  }

  const generateAction = generateRecurringTransactions.bind(null, year, month);

  return (
    <Alert className="mb-6">
      <Terminal className="h-4 w-4" />
      <AlertTitle>¡Acción Requerida!</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <p>
          {`Tienes ${pendingCount} ${pendingCount === 1 ? 'transacción recurrente pendiente' : 'transacciones recurrentes pendientes'} para este mes.`}
        </p>
        <form action={generateAction} className="ml-4">
          <Button type="submit" size="sm">Generar Ahora</Button>
        </form>
      </AlertDescription>
    </Alert>
  );
}