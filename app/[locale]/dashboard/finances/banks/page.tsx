import {
    fetchBankAccounts,
    fetchBankLiquiditySummary,
    fetchBankTransfers,
} from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { Landmark, Wallet, Banknote, DollarSign, LucideIcon, Sparkles, Building2, ArrowLeftRight } from 'lucide-react';
import { AccountBalanceModal } from '@/components/dashboard/finances/banks/account-balance-modal';
import { TransferModal } from '@/components/dashboard/finances/banks/transfer-modal';
import { TransfersTable } from '@/components/dashboard/finances/banks/transfers-table';
import { TranslucentImpactCard } from '@/components/dashboard/finances/invoices/translucent-impact-card';

const accountTypeLabels: Record<string, { label: string; icon: LucideIcon }> = {
    bank: { label: 'Banco Tradicional', icon: Landmark },
    wallet: { label: 'Billetera Virtual', icon: Wallet },
    cash: { label: 'Efectivo', icon: Banknote },
    usd_account: { label: 'Cuenta en USD', icon: DollarSign },
};

export default async function BanksPage() {
    const [accounts, summary, transfers] = await Promise.all([
        fetchBankAccounts(),
        fetchBankLiquiditySummary(),
        fetchBankTransfers(),
    ]);

    // Métricas auxiliares
    const activeAccountsCount = accounts.filter(a => a.is_active).length;
    const usdAccountsCount = accounts.filter(a => a.currency === 'USD').length;

    return (
        <div className="p-4 sm:p-6 w-full m-auto max-w-[1600px] space-y-8 min-h-screen text-foreground">
            {/* 1. Hero Banner with tweakcn aesthetics (Unified Header + KPIs container) */}
            <div className="rounded-[var(--radius)] p-6 sm:p-8 md:p-10 shadow-sm border border-border bg-card relative overflow-hidden">
                {/* Subtle background glow effect */}
                <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

                {/* Banner Top Bar: Title & Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-border relative z-10">
                    <div className="space-y-1.5 w-full lg:w-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary/40 dark:bg-secondary/20 text-secondary-foreground mb-1 border border-border">
                            <Sparkles className="w-3.5 h-3.5 text-accent dark:text-secondary-foreground" />
                            <span>Tesorería & Cuentas</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground/80 font-sans">
                            Bancos y Liquidez
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                            Control de saldos reales disponibles en bancos, billeteras y cajas de ahorro.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <TransferModal accounts={accounts} />
                    </div>
                </div>

                {/* KPIs Grid con TranslucentImpactCard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-6 relative z-10">
                    <TranslucentImpactCard
                        title="Liquidez Total (ARS)"
                        value={formatCurrency(summary.totalARS)}
                        subtitle="Bancos, billeteras y efectivo en pesos"
                        trend="En Pesos"
                        icon={Banknote}
                    />

                    <TranslucentImpactCard
                        title="Reserva Total (USD)"
                        value={`US$ ${summary.totalUSD.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                        subtitle={usdAccountsCount > 0 ? `${usdAccountsCount} cuentas en dólares` : 'Ahorros internacionales'}
                        trend="Dólares"
                        icon={DollarSign}
                    />

                    <TranslucentImpactCard
                        title="Cuentas Activas"
                        value={activeAccountsCount.toString()}
                        subtitle={`${accounts.length} cuentas registradas en total`}
                        trend="Operativas"
                        icon={Landmark}
                    />
                </div>
            </div>

            {/* 2. Grid de Cuentas Registradas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Cuentas Registradas</h2>
                        <p className="text-xs text-muted-foreground">Saldos conciliados en entidades bancarias y billeteras</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                        {accounts.length} {accounts.length === 1 ? 'cuenta' : 'cuentas'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {accounts.map((acc) => {
                        const typeConfig = accountTypeLabels[acc.account_type] || {
                            label: acc.account_type,
                            icon: Landmark,
                        };
                        const Icon = typeConfig.icon;

                        return (
                            <div
                                key={acc.id}
                                className="group relative overflow-hidden rounded-[var(--radius)] p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between bg-card border border-border shadow-sm hover:shadow-md"
                            >
                                <div>
                                    {/* Cabecera de la cuenta: Icono con color, Nombre y Tipo */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 transition-transform duration-200 group-hover:scale-105 bg-card dark:bg-accent/90 text-foreground"
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm tracking-tight text-foreground truncate">
                                                    {acc.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {typeConfig.label}
                                                </p>
                                            </div>
                                        </div>

                                        <AccountBalanceModal account={acc} />
                                    </div>

                                    {/* Contenedor métrico del Saldo (Fondo gris oscuro con texto blanco al estilo del sistema) */}
                                    <div className="my-4 p-4 rounded-xl bg-card text-neutral-900/80 dark:bg-foreground/90 dark:border dark:border-zinc-800 shadow-xs flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-900/70 block">
                                                Saldo Conciliado
                                            </span>
                                            <span className="text-lg sm:text-xl font-bold font-mono text-neutral-900/80 mt-1 block">
                                                {acc.currency === 'USD'
                                                    ? `US$ ${acc.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                                    : formatCurrency(acc.balance)}
                                            </span>
                                        </div>

                                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-white/10 text-neutral-900/80">
                                            {acc.currency}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer de la Card de Cuenta */}
                                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            acc.is_active ? "bg-emerald-500" : "bg-zinc-400"
                                        )} />
                                        <span>{acc.is_active ? "Activa para cobros" : "Inactiva"}</span>
                                    </span>

                                    <span className="text-[11px] font-mono text-muted-foreground/80">
                                        {acc.currency === 'USD' ? 'Divisa Extranjera' : 'Moneda Local'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Historial de Transferencias con Unified Data Canvas */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Movimientos y Transferencias</h2>
                        <p className="text-xs text-muted-foreground">Registro de traspasos de fondos y rebalanceo entre cuentas</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                        {transfers.length} {transfers.length === 1 ? 'movimiento' : 'movimientos'}
                    </span>
                </div>

                <TransfersTable transfers={transfers} />
            </div>
        </div>
    );
}