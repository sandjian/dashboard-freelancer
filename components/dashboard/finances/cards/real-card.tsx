"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, CheckCircle2, Clock, Plus, CreditCard, ArrowUpRight, RotateCcw } from "lucide-react";
import { FlippableCreditCard } from "@/components/ui/flippable-card";
import { CardNetwork } from "@/lib/card-detection";
import { CardNetworkLogo } from "./card-network-logo";
import { DeleteCardDialog } from "./delete-card-dialog";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toggleCardStatementStatus } from "@/lib/actions";
import { PayStatementModal } from "./pay-statement-modal";
import { StatementUploadModal } from "./statement-upload-modal";
import { BankAccount } from "@/lib/definitions";

interface RealCardProps {
    id: string;
    name: string;
    last4?: string | null;
    closingDay: number;
    dueDay: number;
    color?: string;
    colorVariant?: string;
    statement?: {
        id: string | number;
        totalAmount: number;
        paidAmount?: number;
        dueDate: Date;
        status: 'pending' | 'partially_paid' | 'paid';
    } | null;
    year?: number;
    month?: number;
    accounts?: BankAccount[];
}

const METALLIC_GRADIENTS: Record<string, string> = {
    slate: "from-zinc-800 via-zinc-900 to-zinc-950",
    zinc: "from-slate-700 via-zinc-800 to-zinc-900",
    blue: "from-slate-900 via-blue-950 to-zinc-950",
    emerald: "from-zinc-900 via-emerald-950 to-zinc-950",
    purple: "from-zinc-900 via-purple-950 to-zinc-950",
    gold: "from-zinc-900 via-amber-950 to-zinc-950",
    rose: "from-zinc-900 via-rose-950 to-zinc-950",
    cyan: "from-zinc-900 via-cyan-950 to-zinc-950",
    black: "from-zinc-800 via-zinc-900 to-zinc-950",
};

function inferNetworkFromName(name: string): CardNetwork {
    const lower = name.toLowerCase();
    if (lower.includes("visa")) return "visa";
    if (lower.includes("master") || lower.includes("mc")) return "mastercard";
    if (lower.includes("amex") || lower.includes("american")) return "amex";
    return "generic";
}

import { MoreVertical, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RealCard({
    id,
    name,
    last4,
    closingDay,
    dueDay,
    color = 'slate',
    colorVariant,
    statement,
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    accounts = [],
}: RealCardProps) {
    const colorKey = color || colorVariant || 'slate';
    const gradient = METALLIC_GRADIENTS[colorKey] || METALLIC_GRADIENTS.slate;
    const network = inferNetworkFromName(name);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isTogglingPaid, setIsTogglingPaid] = useState(false);

    const defaultDueDate = new Date(year, month - 1, Math.min(dueDay, 28))
        .toISOString()
        .split('T')[0];

    const handleTogglePaid = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!statement) return;
        setIsTogglingPaid(true);
        try {
            await toggleCardStatementStatus(statement.id, statement.status);
        } finally {
            setIsTogglingPaid(false);
        }
    };

    return (
        <div className="relative w-full max-w-[420px] mx-auto group/card px-1">
            {/* Botón flotante estable para eliminar tarjeta sin verse afectado por el giro 3D */}
            <div className="absolute -top-2.5 right-1 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 rounded-full shadow-md hover:scale-105 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteDialogOpen(true);
                    }}
                    title="Eliminar tarjeta"
                    aria-label="Eliminar tarjeta"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>

            <div className="relative rounded-[16px] transition-all duration-300 group-hover/card:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]">
                {/* Renderizado de la tarjeta con flip en hover */}
                <FlippableCreditCard
                    bankName={name}
                    cardholderName="CARDHOLDER"
                    cardNumber={`•••• •••• •••• ${last4 || '••••'}`}
                    expiryDate=""
                    brand={network}
                    gradientClass={gradient}
                    flipOnHover={true}
                    className="w-full"
                    customFooter={
                        <div className="flex justify-between items-end">
                            <div className="flex gap-4 text-white">
                                <div className="flex flex-col items-start">
                                    <span className="text-[8px] uppercase tracking-[0.14em] font-mono text-zinc-400">Cierra</span>
                                    <span className="font-mono text-xs font-semibold text-white">Día {closingDay}</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[8px] uppercase tracking-[0.14em] font-mono text-zinc-400">Vence</span>
                                    <span className="font-mono text-xs font-semibold text-white">Día {dueDay}</span>
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center justify-end">
                                <CardNetworkLogo network={network} />
                            </div>
                        </div>
                    }
                    customBack={
                        <div className="flex flex-col justify-between h-full pt-1">
                            {/* Fila superior en el dorso: Estado y Menú de 3 puntos */}
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono font-medium tracking-wider uppercase text-white/70">
                                    {statement ? (
                                        statement.status === 'paid' 
                                            ? 'Resumen Saldado' 
                                            : statement.status === 'partially_paid'
                                            ? 'Resumen Parcial'
                                            : 'Resumen Pendiente'
                                    ) : 'Sin Movimientos'}
                                </span>

                                <div className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer outline-none shadow-xs"
                                                aria-label="Más opciones"
                                            >
                                                <MoreVertical className="w-3.5 h-3.5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44 bg-card border-border text-foreground">
                                            <DropdownMenuItem
                                                onClick={() => setIsDeleteDialogOpen(true)}
                                                className="text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-500/10 cursor-pointer gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Eliminar tarjeta</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Centro del dorso: Total del período */}
                            <div className="text-center py-1">
                                {statement ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">
                                                {statement.status === 'partially_paid' ? 'Saldo Restante' : 'Total Período'}
                                            </span>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white drop-shadow-sm">
                                            {formatCurrency(
                                                statement.status === 'partially_paid'
                                                    ? Math.max(0, statement.totalAmount - (statement.paidAmount || 0))
                                                    : statement.totalAmount
                                            )}
                                        </p>
                                        {statement.status === 'partially_paid' ? (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-200 font-mono text-[10px]">
                                                <span>Parcial:</span>
                                                <span className="font-semibold text-white">{formatCurrency(statement.paidAmount || 0)}</span>
                                                <span>/</span>
                                                <span>{formatCurrency(statement.totalAmount)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-mono text-white/60 block">
                                                Vence: {new Date(statement.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/70 font-mono">No hay resumen cargado este mes</p>
                                )}
                            </div>

                            {/* Botones integrados en el dorso: Ver Detalle encima de Cargar/Pagar/Reabrir */}
                            <div className="w-full space-y-2 pb-1">
                                <Link
                                    href={`/dashboard/finances/cards/${id}`}
                                    className="w-full h-8 rounded-lg text-xs font-medium font-mono text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                >
                                    <span>Ver Detalle</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>

                                {statement ? (
                                    statement.status === 'paid' ? (
                                        <button
                                            onClick={handleTogglePaid}
                                            disabled={isTogglingPaid}
                                            className="w-full h-8 rounded-lg text-xs font-medium font-mono text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>{isTogglingPaid ? "Actualizando..." : "Reabrir Resumen"}</span>
                                        </button>
                                    ) : (
                                        <div className="w-full">
                                            <PayStatementModal
                                                statementId={statement.id.toString()}
                                                cardName={name}
                                                totalAmount={statement.totalAmount}
                                                paidAmount={statement.paidAmount || 0}
                                                accounts={accounts}
                                            />
                                        </div>
                                    )
                                ) : (
                                    <StatementUploadModal
                                        cardId={id}
                                        cardName={name}
                                        year={year}
                                        month={month}
                                        defaultDueDate={defaultDueDate}
                                    />
                                )}
                            </div>
                        </div>
                    }
                />
            </div>

            {/* Modal de confirmación para eliminar tarjeta */}
            <DeleteCardDialog
                cardId={id}
                cardName={name}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </div>
    );
}