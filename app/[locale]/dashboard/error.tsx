'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          No pudimos sincronizar los datos financieros
        </h2>
        <p className="text-xs text-muted-foreground">
          Ocurrió una interrupción temporal al consultar la base de datos. Tus registros están seguros.
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-muted-foreground/70">
            Código de diagnóstico: {error.digest}
          </p>
        )}
        <Button onClick={() => reset()} className="w-full gap-2 rounded-xl">
          <RotateCcw className="w-4 h-4" />
          <span>Reintentar carga</span>
        </Button>
      </div>
    </div>
  );
}

