
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Earning } from "@/lib/definitions";
import { CreateEarningForm } from "@/components/dashboard/earnings/create-form";
import { EarningActions } from "@/components/dashboard/actions-menu";
import Search from "@/components/ui/search";

interface EarningsTableProps {
  data: Earning[];
  getBadgeVariant: (status: Earning['status']) => "success" | "default" | "secondary";
}

export function EarningsTableWrapper({ data, getBadgeVariant }: EarningsTableProps) {
  return (
    <div className="bg-red-500 h-full">
      <div className="flex items-center justify-between mb-4">
<Search placeholder="Buscar por cliente o concepto..." />
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-2">Añadir Ingreso</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ingreso</DialogTitle>
            </DialogHeader>
            <CreateEarningForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Estado</TableHead>
              {/* 👇 Columna de Moneda eliminada */}
              <TableHead className="text-right">Monto</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((earning) => (
              <TableRow key={earning.id}>
                <TableCell>{earning.dueDate.toLocaleDateString('es-AR', {day: '2-digit', month:'2-digit'})}</TableCell>
                <TableCell>{earning.client}</TableCell>
                <TableCell className="font-medium">{earning.concept}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(earning.status)}>
                    {earning.status}
                  </Badge>
                </TableCell>
                {/* 👇 Celda de Moneda eliminada */}
                <TableCell className="text-right">
                  {/* Esta función ya se encarga de poner el símbolo correcto (US$ o $) */}
                  {new Intl.NumberFormat('es-AR', { 
                    style: 'currency', 
                    currency: earning.currency || 'ARS' 
                  }).format(earning.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <EarningActions earningId={earning.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
      </div>
    </div>
  );
}