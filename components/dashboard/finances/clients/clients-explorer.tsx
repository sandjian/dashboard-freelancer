"use client";

import * as React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Plus,
  ArrowUpRight,
  Search,
  LayoutGrid,
  List
} from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientCardUnified } from "./client-card-unified";
import { EditClientModal } from "./edit-client-modal";
import { DeleteClientDialog } from "./delete-client-dialog";
import type { ClientWithStats } from "@/lib/definitions";

interface ClientsExplorerProps {
  clients: ClientWithStats[];
}

export function ClientsExplorer({ clients }: ClientsExplorerProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "up_to_date" | "pending" | "overdue">("all");

  // Filtering
  const filteredClients = React.useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.brand && client.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const isOverdue = client.overdue_amount > 0 || client.overdue_invoices > 0;
      const hasPending = client.pending_amount > 0 || client.pending_invoices > 0;
      const isUpToDate = !isOverdue && !hasPending;

      if (statusFilter === "overdue") return isOverdue;
      if (statusFilter === "pending") return hasPending && !isOverdue;
      if (statusFilter === "up_to_date") return isUpToDate;

      return true;
    });
  }, [clients, searchQuery, statusFilter]);

  return (
    /* Unified Data Canvas (Toolbar + Table/Grid in a Single Block) */
    <div className="rounded-[var(--radius)] bg-card border border-border shadow-sm overflow-hidden">
      {/* Integrated Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 p-3.5 sm:p-5 border-b border-border bg-muted/20">
        {/* Search Input */}
        <div className="w-full md:max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-9 h-10 bg-background border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter Buttons & View Mode Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-between sm:justify-start">
          {/* Status Buttons identical to Invoices and Expenses StatusButtons */}
          <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border w-max min-w-full sm:min-w-0 justify-between sm:justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                statusFilter === "all"
                  ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Todos ({clients.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("up_to_date")}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                statusFilter === "up_to_date"
                  ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Al Día
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                statusFilter === "pending"
                  ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Pendientes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("overdue")}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                statusFilter === "overdue"
                  ? "bg-neutral-200/80 text-neutral-900 dark:bg-zinc-800 dark:text-zinc-200 font-semibold shadow-xs border border-neutral-300 dark:border-zinc-700"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              En Mora
            </Button>
          </div>

          {/* Grid / Table Toggle */}
          <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 w-8 rounded-lg cursor-pointer transition-all",
                viewMode === "grid"
                  ? "bg-secondary/40 text-secondary-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Vista cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("table")}
              className={cn(
                "h-8 w-8 rounded-lg cursor-pointer transition-all",
                viewMode === "table"
                  ? "bg-secondary/40 text-secondary-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Vista tabla"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area inside Canvas */}
      <div className="min-h-[480px] p-4 sm:p-6 bg-card flex flex-col justify-between">
        {filteredClients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-muted/20 text-muted-foreground text-center">
            <p className="text-sm font-medium">No se encontraron clientes con los filtros seleccionados.</p>
            <p className="text-xs mt-1">Prueba limpiando la búsqueda o cambiando el filtro de estado.</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View inside Canvas - 3 por fila para mayor amplitud y claridad */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 sm:gap-6">
            {filteredClients.map((client) => (
              <ClientCardUnified key={client.id} client={client} />
            ))}
          </div>
        ) : (
          /* Dense Financial Table View with identical styles from Invoices Table */
          <div className="rounded-[var(--radius)] border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent bg-muted/10">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pl-4 sm:pl-6">
                    Cliente
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                    Estado
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                    Saldo Pendiente
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                    Total Facturado
                  </TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                    Facturas
                  </TableHead>
                  <TableHead className="w-[88px] py-3.5 pr-4 sm:pr-6 text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const isOverdue = client.overdue_amount > 0 || client.overdue_invoices > 0;
                  const hasPending = client.pending_amount > 0 || client.pending_invoices > 0;
                  const isPaid = !isOverdue && !hasPending;
                  const initials = client.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <TableRow key={client.id} className="bg-transparent border-b border-border/20 hover:bg-muted/30 transition-colors">
                      {/* Cliente */}
                      <TableCell className="py-3.5 pl-4 sm:pl-6">
                        <Link
                          href={`/dashboard/finances/clients/${client.id}`}
                          className="group flex items-center gap-3"
                        >
                          <div className="hidden sm:block">
                            <Avatar className="h-8 w-8 border border-border/50 shadow-xs">
                              <AvatarImage src={client.image_url || ''} alt={client.name} />
                              <AvatarFallback className="bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background text-xs font-semibold transition-colors">
                                {initials || "CL"}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                            <div className="font-medium text-foreground text-sm decoration-foreground/30 underline-offset-4 group-hover:underline group-hover:decoration-foreground/70 transition-all duration-200 truncate">
                              {client.name}
                            </div>
                            <div className="text-xs text-muted-foreground transition-colors truncate">
                              {client.brand || client.email || "Cliente Directo"}
                            </div>
                          </div>
                        </Link>
                      </TableCell>

                      {/* Estado: Badge unificado y limpio idéntico al de invoices */}
                      <TableCell className="py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 text-[11px] leading-none px-2.5 py-1 rounded-md border transition-colors whitespace-nowrap",
                            isPaid && "bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-white/[0.08] dark:text-zinc-100 dark:border-white/20",
                            hasPending && !isOverdue && "bg-neutral-100/80 text-neutral-600 border-neutral-300 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800/80",
                            isOverdue && "bg-neutral-200/80 text-neutral-800 border-neutral-300 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-700"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              isPaid && "bg-secondary/40 dark:bg-foreground/90",
                              hasPending && !isOverdue && "border border-neutral-500 bg-transparent dark:border-zinc-500",
                              isOverdue && "bg-neutral-700 dark:bg-zinc-400"
                            )}
                          />
                          <span>
                            {isOverdue
                              ? `Mora (${client.overdue_invoices})`
                              : hasPending
                              ? `Pendiente (${client.pending_invoices})`
                              : "Al día"}
                          </span>
                        </span>
                      </TableCell>

                      {/* Saldo Pendiente */}
                      <TableCell className="py-3.5 text-right font-mono tabular-nums font-semibold text-xs sm:text-sm whitespace-nowrap">
                        {client.pending_amount + client.overdue_amount > 0 ? (
                          <span className={isOverdue ? "text-neutral-900 dark:text-zinc-100 font-bold" : "text-muted-foreground"}>
                            {formatCurrency(client.pending_amount + client.overdue_amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">$0</span>
                        )}
                      </TableCell>

                      {/* Total Facturado */}
                      <TableCell className="py-3.5 text-right font-mono tabular-nums font-semibold text-xs sm:text-sm text-secondary/40 dark:text-foreground/90 whitespace-nowrap">
                        {formatCurrency(client.total_billed || client.total_revenue || 0)}
                      </TableCell>

                      {/* Cantidad de Facturas */}
                      <TableCell className="py-3.5 text-center text-xs text-muted-foreground font-medium">
                        {client.total_invoices}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="py-3.5 pr-4 sm:pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs hover:bg-muted/80 text-foreground font-medium"
                          >
                            <Link href={`/dashboard/finances/invoices/create?client_id=${client.id}`} title="Nueva Factura">
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              <span>Facturar</span>
                            </Link>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 bg-card border-border text-foreground">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/finances/clients/${client.id}`}>
                                  Ver Perfil
                                </Link>
                              </DropdownMenuItem>
                              <div onSelect={(e) => e.preventDefault()}>
                                <EditClientModal
                                  client={{
                                    ...client,
                                    email: client.email || undefined,
                                    brand: client.brand || undefined,
                                    phone: client.phone || undefined,
                                    image_url: client.image_url || undefined,
                                  }}
                                  trigger={
                                    <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted text-foreground w-full">
                                      Editar
                                    </div>
                                  }
                                />
                              </div>
                              <DropdownMenuSeparator />
                              <div onSelect={(e) => e.preventDefault()}>
                                <DeleteClientDialog
                                  clientId={client.id}
                                  clientName={client.name}
                                  trigger={
                                    <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive w-full">
                                      Eliminar
                                    </div>
                                  }
                                />
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer info strip */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/30 text-xs text-muted-foreground">
          <span>Mostrando {filteredClients.length} de {clients.length} clientes</span>
          <span>Directorio de Clientes</span>
        </div>
      </div>
    </div>
  );
}
