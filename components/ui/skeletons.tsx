
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';


// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-200" />
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
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="rounded-xl bg-gray-100 p-4">
        <div className="mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-white p-4 sm:grid-cols-13 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 p-4">
        <div className="bg-white px-6">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </>
  );
}


export function InvoicesMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </div>
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
          <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-gray-100"></div>
          <div className="h-10 w-10 rounded bg-gray-100"></div>
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
    <tr className="w-full border-b border-gray-100 last-of-type:border-none">
      {/* Celda Cliente */}
      <td className="relative overflow-hidden whitespace-nowrap py-4 pl-4 pr-3">
        <div className="h-6 w-24 rounded bg-gray-100"></div>
      </td>
      {/* Celda Fecha */}
      <td className="whitespace-nowrap px-3 py-4">
        <div className="h-6 w-20 rounded bg-gray-100"></div>
      </td>
      {/* Celda Estado */}
      <td className="whitespace-nowrap px-3 py-4">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Celda Monto */}
      <td className="whitespace-nowrap px-3 py-4 text-right">
        <div className="h-6 w-24 rounded bg-gray-100 ml-auto"></div>
      </td>
      {/* Celda Acciones */}
      <td className="whitespace-nowrap py-4 pl-3 pr-4">
        <div className="h-8 w-8 rounded-md bg-gray-100 ml-auto"></div>
      </td>
    </tr>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha de Emisión</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
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
    <TableRow className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Fecha */}
      <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="h-6 w-20 rounded bg-gray-100"></div>
      </TableCell>
      {/* Concepto */}
      <TableCell className="px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-100"></div>
      </TableCell>
      {/* Categoría */}
      <TableCell className="px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-100"></div>
      </TableCell>
      {/* Método de Pago */}
      <TableCell className="px-3 py-3">
        <div className="h-6 w-28 rounded bg-gray-100"></div>
      </TableCell>
      {/* Estado */}
      <TableCell className="px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </TableCell>
      {/* Monto */}
      <TableCell className="whitespace-nowrap px-3 py-3 text-right">
        <div className="h-6 w-24 rounded bg-gray-100 ml-auto"></div>
      </TableCell>
      {/* Acciones */}
      <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-7 w-7 rounded-full bg-gray-100"></div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Esqueleto completo para la tabla de gastos
export function ExpensesTableSkeleton() {
  return (
    <div className={`${shimmer} relative overflow-hidden rounded-md border`}>
      <Table>
        <TableHeader>
          <TableRow>
            {/* Estos son los encabezados de tu tabla real */}
            <TableHead>Fecha</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Método de Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
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
