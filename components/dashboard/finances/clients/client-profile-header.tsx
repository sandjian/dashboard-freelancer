'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ClientWithStats } from "@/lib/definitions";
import { formatCurrency } from "@/lib/utils";
import { Building2, Mail, Phone, ArrowLeft, Plus, Pencil, Sparkles, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { EditClientModal } from "./edit-client-modal";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function ClientProfileHeader({ client }: { client: ClientWithStats }) {
    const avatarInitials = client.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const isOverdue = (client.overdue_amount || 0) > 0 || (client.overdue_invoices || 0) > 0;
    const hasPending = (client.pending_amount || 0) > 0 || (client.pending_invoices || 0) > 0;
    const isPaid = !isOverdue && !hasPending;

    return (
        <div className="space-y-4">
            {/* Breadcrumb idéntico al del resto del sistema */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard/finances/clients" className="text-muted-foreground hover:text-foreground">
                            Clientes
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-foreground font-medium">{client.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Hero Banner con tweakcn aesthetics idéntico a Invoices / Expenses / Cards */}
            <div className="rounded-[var(--radius)] p-6 sm:p-8 md:p-10 shadow-sm border border-border bg-card relative overflow-hidden">
                {/* Subtle background glow effect */}
                <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-border relative z-10">
                    {/* Left: Avatar + Identidad del Cliente */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-border/50 shadow-xs shrink-0">
                            {client.image_url ? (
                                <AvatarImage src={client.image_url} alt={client.name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="rounded-2xl bg-secondary/40 text-secondary-foreground dark:text-background font-semibold text-xl sm:text-2xl transition-colors">
                                {avatarInitials || "CL"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1.5 min-w-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary/40 dark:bg-secondary/20 text-secondary-foreground mb-1 border border-border">
                                <Sparkles className="w-3.5 h-3.5 text-accent dark:text-secondary-foreground" />
                                <span>Ficha de Cliente</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground/80 font-sans truncate">
                                    {client.name}
                                </h1>

                                {/* Badge de Salud Financiera idéntico a Invoices */}
                                <span
                                    className="inline-flex items-center justify-center gap-1.5 text-[11px] leading-none px-2.5 py-1 rounded-md border transition-colors whitespace-nowrap"
                                    style={{
                                        backgroundColor: isPaid
                                            ? "var(--muted)"
                                            : hasPending && !isOverdue
                                            ? "var(--muted)"
                                            : "rgba(220, 38, 38, 0.1)",
                                        borderColor: "var(--border)",
                                    }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: isPaid
                                                ? "var(--chart-1)"
                                                : hasPending && !isOverdue
                                                ? "var(--chart-2)"
                                                : "var(--chart-3)",
                                        }}
                                    />
                                    <span className="font-medium text-foreground">
                                        {isOverdue
                                            ? `Mora: ${formatCurrency(client.overdue_amount)}`
                                            : hasPending
                                            ? `Por cobrar: ${formatCurrency(client.pending_amount)}`
                                            : "Al día (Sin deuda)"}
                                    </span>
                                </span>
                            </div>

                            {/* Datos de contacto alineados */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{client.brand || "Cliente Directo"}</span>
                                </div>

                                {client.email && (
                                    <a
                                        href={`mailto:${client.email}`}
                                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5 shrink-0" />
                                        <span>{client.email}</span>
                                    </a>
                                )}

                                {client.phone && (
                                    <a
                                        href={`tel:${client.phone}`}
                                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                    >
                                        <Phone className="w-3.5 h-3.5 shrink-0" />
                                        <span>{client.phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Botones de Acción (Volver, Editar, Facturar) */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold"
                        >
                            <Link href="/dashboard/finances/clients">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                <span>Volver</span>
                            </Link>
                        </Button>

                        <EditClientModal
                            client={{
                                ...client,
                                email: client.email || undefined,
                                brand: client.brand || undefined,
                                phone: client.phone || undefined,
                                image_url: client.image_url || undefined,
                            }}
                            trigger={
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold cursor-pointer"
                                >
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                    <span>Editar</span>
                                </Button>
                            }
                        />

                        <Button
                            asChild
                            className="relative overflow-hidden bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 hover:border-secondary/30 hover:text-accent dark:hover:text-secondary-foreground shadow-sm font-semibold transition-all duration-300 group h-10 px-5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
                        >
                            <Link href={`/dashboard/finances/invoices/create?client_id=${client.id}`}>
                                <div className="flex items-center justify-center gap-2 relative z-10 tracking-wide text-sm font-medium">
                                    <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                                    <span>Nueva Factura</span>
                                </div>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Subtítulo informativo */}
                <div className="pt-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2 relative z-10">
                    <span>Información histórica consolidada y estado de cuenta del cliente</span>
                    <span>ID: {client.id.slice(0, 8)}...</span>
                </div>
            </div>
        </div>
    );
}
