"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  MoreVertical,
} from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditClientModal } from "./edit-client-modal";
import { DeleteClientDialog } from "./delete-client-dialog";
import type { ClientWithStats } from "@/lib/definitions";

interface ClientCardUnifiedProps {
  client: ClientWithStats;
}

export function ClientCardUnified({ client }: ClientCardUnifiedProps) {
  const avatarInitials = client.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isOverdue = client.overdue_amount > 0 || client.overdue_invoices > 0;
  const hasPending = client.pending_amount > 0 || client.pending_invoices > 0;

  // Monto adeudado o pendiente
  const debtAmount = isOverdue
    ? client.overdue_amount
    : hasPending
      ? client.pending_amount
      : 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius)] p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between",
        "bg-card border border-border shadow-sm hover:shadow-md"
      )}
    >
      {/* Contenido Principal */}
      <div className="relative z-10">
        {/* Cabecera: Avatar, Nombre/Empresa y Menú de opciones */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar: bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground */}
            <Avatar className="h-11 w-11 border border-border/70 shadow-xs shrink-0">
              {client.image_url ? (
                <AvatarImage src={client.image_url} alt={client.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background text-xs font-semibold transition-colors">
                {avatarInitials || "CL"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/dashboard/finances/clients/${client.id}`}
                  className="font-semibold text-sm tracking-tight text-foreground hover:underline truncate inline-block"
                >
                  {client.name}
                </Link>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate mt-0.5">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{client.brand || "Cliente Directo"}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Dropdown */}
          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border/60 transition-colors cursor-pointer outline-none shadow-xs"
                  aria-label="Más opciones"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border text-foreground">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Acciones
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/finances/invoices/create?client_id=${client.id}`}
                    className="cursor-pointer gap-2"
                  >
                    <span>Nueva Factura</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/finances/clients/${client.id}`}
                    className="cursor-pointer gap-2"
                  >
                    <span>Ver Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
                        Editar Datos
                      </div>
                    }
                  />
                </div>
                <div onSelect={(e) => e.preventDefault()}>
                  <DeleteClientDialog
                    clientId={client.id}
                    clientName={client.name}
                    trigger={
                      <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive w-full">
                        Eliminar Cliente
                      </div>
                    }
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Contenedor de Métricas Financieras: bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground */}
        <div className="grid grid-cols-3 gap-2 my-4 p-3.5 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground transition-colors shadow-xs">
          {/* 1. Total Facturado */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-secondary-foreground/75 dark:text-background/75 block">
              Facturado
            </span>
            <span className="text-xs sm:text-sm font-semibold font-mono text-secondary-foreground dark:text-neutral-700/80 truncate mt-1">
              {formatCurrency(client.total_billed || client.total_revenue || 0)}
            </span>
          </div>

          {/* 2. Facturas Emitidas */}
          <div className="flex flex-col border-x border-secondary-foreground/20 dark:border-background/20 px-2 sm:px-2.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-secondary-foreground/75 dark:text-background/75 block">
              Emitidas
            </span>
            <span className="text-xs sm:text-sm font-semibold text-secondary-foreground dark:text-neutral-700/80 truncate mt-1">
              {client.total_invoices} {client.total_invoices === 1 ? "factura" : "facturas"}
            </span>
          </div>

          {/* 3. Monto Adeudado / Saldo */}
          <div className="flex flex-col pl-1 sm:pl-1.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-secondary-foreground/75 dark:text-background/75 block">
              Adeudado
            </span>
            <span
              className="text-xs sm:text-sm font-semibold font-mono text-secondary-foreground dark:text-neutral-700/80 truncate mt-1"
              title={
                isOverdue
                  ? `Mora: ${formatCurrency(client.overdue_amount)}`
                  : hasPending
                    ? `Pendiente: ${formatCurrency(client.pending_amount)}`
                    : "Al día (Sin deuda)"
              }
            >
              {debtAmount > 0 ? formatCurrency(debtAmount) : "$0"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer de la Card: Botones de Acción directos sin redes sociales */}
      <div className="pt-3 border-t border-border flex items-center gap-2.5 w-full relative z-10">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 flex-1 rounded-lg text-xs font-semibold border-neutral-300 dark:border-neutral-700 bg-background hover:bg-muted text-neutral-900 dark:text-neutral-100 transition-colors shadow-2xs"
        >
          <Link href={`/dashboard/finances/clients/${client.id}`} className="text-center justify-center">
            Ver Perfil
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          className="h-9 flex-1 rounded-lg text-xs font-semibold bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground dark:text-background transition-colors shadow-2xs"
        >
          <Link href={`/dashboard/finances/invoices/create?client_id=${client.id}`} title="Facturar a este cliente" className="text-center justify-center">
            Facturar
          </Link>
        </Button>
      </div>
    </div>
  );
}
