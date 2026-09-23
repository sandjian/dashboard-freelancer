
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';


// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-card p-2 shadow-sm border border-border`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-muted" />
        <div className="ml-2 h-6 w-16 rounded-md bg-muted text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-muted/20 px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden lg:col-span-2`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-muted" />
      <div className="rounded-xl bg-card p-4 border border-border">
        <div className="mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-muted/10 p-4 sm:grid-cols-13 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-muted" />
          <div className="ml-2 h-4 w-20 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-border py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-muted" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-muted" />
          <div className="mt-2 h-4 w-12 rounded-md bg-muted" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-muted" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-muted" />
      <div className="flex grow flex-col justify-between rounded-xl bg-card p-4 border border-border">
        <div className="bg-transparent px-6">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-muted" />
          <div className="ml-2 h-4 w-20 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function PredictiveInsightsSkeleton() {
  return (
    <div className={`${shimmer} flex flex-col gap-4 col-span-1 lg:col-span-1 h-full`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-2">
        <div className="h-5 w-5 rounded-full bg-muted" />
        <div className="h-5 w-32 rounded-md bg-muted" />
      </div>

      {/* Container for Cards */}
      <div className="flex-1 flex flex-col gap-4">

        {/* Card 1 */}
        <div className="flex-1 relative overflow-hidden rounded-xl bg-card border-l-4 border-l-muted border-y border-r border-border p-5 flex flex-col justify-center">
          <div className="h-4 w-24 rounded bg-muted mb-3" />
          <div className="h-8 w-32 rounded bg-muted mb-2" />
          <div className="h-3 w-40 rounded bg-muted" />
        </div>

        {/* Card 2 */}
        <div className="flex-1 relative overflow-hidden rounded-xl bg-card border-l-4 border-l-muted border-y border-r border-border p-5 flex flex-col justify-center">
          <div className="h-4 w-24 rounded bg-muted mb-3" />
          <div className="h-8 w-32 rounded bg-muted mb-2" />
          <div className="h-3 w-40 rounded bg-muted" />
        </div>

        {/* Card 3 */}
        <div className="flex-1 relative overflow-hidden rounded-xl bg-card border-l-4 border-l-muted border-y border-r border-border p-5 flex flex-col justify-center">
          <div className="h-4 w-24 rounded bg-muted mb-3" />
          <div className="h-8 w-32 rounded bg-muted mb-2" />
          <div className="h-3 w-40 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`${shimmer} flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-border bg-card h-[86px]`}
        >
          <div className="h-8 w-8 rounded-full bg-muted mb-1" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-muted`}
      />

      {/* Quick Actions Skeleton */}
      <QuickActionsSkeleton />

      {/* 1. Metric Cards Grid (2 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* 2. Chart & Insights Grid (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RevenueChartSkeleton /> {/* Used for FinanceChart (col-span-2) */}
        <PredictiveInsightsSkeleton /> {/* New specific skeleton */}
      </div>

      {/* 3. Recent Activity */}
      <div className="space-y-4">
        <div className={`${shimmer} relative w-full h-48 overflow-hidden rounded-xl bg-card border border-border`} />
      </div>
    </>
  );
}


export function InvoicesMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-card p-4 border border-border">
      <div className="flex items-center justify-between border-b border-border pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-muted"></div>
          <div className="h-6 w-16 rounded bg-muted"></div>
        </div>
        <div className="h-6 w-16 rounded bg-muted"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-muted"></div>
          <div className="mt-2 h-6 w-24 rounded bg-muted"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-muted"></div>
          <div className="h-10 w-10 rounded bg-muted"></div>
        </div>
      </div>
    </div>
  );
}




export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}



function TableRowSkeleton() {
  return (
    <tr className="w-full border-b border-border last-of-type:border-none">
      {/* Celda Cliente */}
      <td className="relative overflow-hidden whitespace-nowrap py-4 pl-4 pr-3">
        <div className="h-6 w-24 rounded bg-muted"></div>
      </td>
      {/* Celda Fecha */}
      <td className="whitespace-nowrap px-3 py-4">
        <div className="h-6 w-20 rounded bg-muted"></div>
      </td>
      {/* Celda Estado */}
      <td className="whitespace-nowrap px-3 py-4">
        <div className="h-6 w-16 rounded bg-muted"></div>
      </td>
      {/* Celda Monto */}
      <td className="whitespace-nowrap px-3 py-4 text-right">
        <div className="h-6 w-24 rounded bg-muted ml-auto"></div>
      </td>
      {/* Celda Acciones */}
      <td className="whitespace-nowrap py-4 pl-3 pr-4">
        <div className="h-8 w-8 rounded-md bg-muted ml-auto"></div>
      </td>
    </tr>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Cliente</TableHead>
            <TableHead className="text-muted-foreground">Fecha de Emisión</TableHead>
            <TableHead className="text-muted-foreground">Estado</TableHead>
            <TableHead className="text-right text-muted-foreground">Monto</TableHead>
            <TableHead><span className="sr-only">Acciones</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </TableBody>
      </Table>
    </div>
  );
}



function ExpenseTableRowSkeleton() {
  return (
    <TableRow className="w-full border-b border-border last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg hover:bg-transparent">
      {/* Fecha */}
      <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="h-6 w-20 rounded bg-muted"></div>
      </TableCell>
      {/* Concepto */}
      <TableCell className="px-3 py-3">
        <div className="h-6 w-32 rounded bg-muted"></div>
      </TableCell>
      {/* Categoría */}
      <TableCell className="px-3 py-3">
        <div className="h-6 w-24 rounded bg-muted"></div>
      </TableCell>
      {/* Método de Pago */}
      <TableCell className="px-3 py-3">
        <div className="h-6 w-28 rounded bg-muted"></div>
      </TableCell>
      {/* Estado */}
      <TableCell className="px-3 py-3">
        <div className="h-6 w-16 rounded bg-muted"></div>
      </TableCell>
      {/* Monto */}
      <TableCell className="whitespace-nowrap px-3 py-3 text-right">
        <div className="h-6 w-24 rounded bg-muted ml-auto"></div>
      </TableCell>
      {/* Acciones */}
      <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-7 w-7 rounded-full bg-muted"></div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Esqueleto completo para la tabla de gastos
export function ExpensesTableSkeleton() {
  return (
    <div className={`${shimmer} relative overflow-hidden rounded-md border border-border`}>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {/* Estos son los encabezados de tu tabla real */}
            <TableHead className="text-muted-foreground">Fecha</TableHead>
            <TableHead className="text-muted-foreground">Concepto</TableHead>
            <TableHead className="text-muted-foreground">Categoría</TableHead>
            <TableHead className="text-muted-foreground">Método de Pago</TableHead>
            <TableHead className="text-muted-foreground">Estado</TableHead>
            <TableHead className="text-right text-muted-foreground">Monto</TableHead>
            <TableHead><span className="sr-only">Acciones</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Repetimos el esqueleto de la fila varias veces */}
          <ExpenseTableRowSkeleton />
          <ExpenseTableRowSkeleton />
          <ExpenseTableRowSkeleton />
          <ExpenseTableRowSkeleton />
          <ExpenseTableRowSkeleton />
          <ExpenseTableRowSkeleton />
        </TableBody>
      </Table>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6 mb-8">
      <div>
        <div className="h-8 w-48 rounded-md bg-muted mb-2" />
        <div className="h-4 w-96 rounded-md bg-muted" />
      </div>
      <div className="h-10 w-32 rounded-md bg-muted" />
    </div>
  );
}

export function RealCardsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="max-w-md w-full mx-auto">
          <div className={`${shimmer} relative overflow-hidden rounded-xl h-56 bg-card border border-border p-6 flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
              <div className="h-6 w-24 rounded bg-muted" />
              <div className="h-8 w-12 rounded bg-muted" />
            </div>
            <div className="space-y-4">
              <div className="h-8 w-48 rounded bg-muted" />
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-4 w-12 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClientsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`${shimmer} relative overflow-hidden rounded-xl border border-border bg-card p-6 flex flex-col gap-4`}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgendaSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 p-4 border border-border rounded-xl bg-card">
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-md bg-muted" />
          <div className="h-9 w-9 rounded-md bg-muted" />
        </div>
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-md bg-muted" />
          <div className="h-9 w-9 rounded-md bg-muted" />
        </div>
      </div>
      {/* Grid */}
      <div className={`${shimmer} relative border border-border rounded-xl bg-card flex-1 min-h-[500px] grid grid-cols-7 grid-rows-5`}>
        {[...Array(35)].map((_, i) => (
          <div key={i} className="border-r border-b border-border h-32 p-2">
            {i < 5 && <div className="h-3 w-8 rounded bg-muted mb-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
