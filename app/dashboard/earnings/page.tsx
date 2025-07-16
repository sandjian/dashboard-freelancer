import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Earning } from "@/lib/definitions";
import { CreateEarningForm } from "@/ui/dashboard/earnings/create-form";

// Datos de prueba (eventualmente vendrá de la base de datos)
const DUMMY_EARNINGS: Earning[] = [
  { id: '1', concept: 'Diseño de Logo', client: 'TechCorp', amount: 50000, status: 'Pagado', dueDate: '2025-07-10' },
  { id: '2', concept: 'Gestión de Redes - Julio', client: 'InnovateX', amount: 120000, status: 'Facturado', dueDate: '2025-07-30' },
  { id: '3', concept: 'Consultoría SEO', client: 'MarketingPro', amount: 75000, status: 'Atrasado', dueDate: '2025-06-28' },
  { id: '4', concept: 'Desarrollo Landing Page', client: 'InnovateX', amount: 95000, status: 'Pagado', dueDate: '2025-06-15' },
];

export default function EarningsPage() {
  
  const getBadgeVariant = (status: Earning['status']) => {
    switch (status) {
      case 'Pagado':
        return 'success';
      case 'Atrasado':
        return 'destructive';
      case 'Facturado':
      default:
        return 'default';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* SECCIÓN DE KPIs */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado (Mes)</CardTitle>
            <span className="text-green-500">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$145,000.00</div>
            <p className="text-xs text-muted-foreground">+15% vs. el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <span className="text-orange-500">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$195,000.00</div>
            <p className="text-xs text-muted-foreground">2 facturas pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN DE ACCIONES Y TÍTULO */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Ingresos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Añadir Ingreso</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ingreso</DialogTitle>
            </DialogHeader>
            <CreateEarningForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLA DE INGRESOS */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Concepto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_EARNINGS.map((earning) => (
              <TableRow key={earning.id}>
                <TableCell className="font-medium">{earning.concept}</TableCell>
                <TableCell>{earning.client}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(earning.status)}>
                    {earning.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(earning.dueDate).toLocaleDateString('es-AR')}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(earning.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}