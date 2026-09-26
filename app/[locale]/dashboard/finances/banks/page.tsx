import { requireUser } from '@/lib/auth-guard';
import {
    fetchBankAccounts,
    fetchBankLiquiditySummary,
    fetchBankTransfers,
} from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { Landmark, Wallet, Banknote, DollarSign, LucideIcon, Sparkles, Building2, ArrowLeftRight } from 'lucide-react';
import { AccountBalanceModal } from '@/components/dashboard/finances/banks/account-balance-modal';
import { CreateAccountModal } from '@/components/dashboard/finances/banks/create-account-modal';
import { TransferModal } from '@/components/dashboard/finances/banks/transfer-modal';
import { TransfersTable } from '@/components/dashboard/finances/banks/transfers-table';
import { TranslucentImpactCard } from '@/components/dashboard/finances/invoices/translucent-impact-card';
import { getTranslations } from 'next-intl/server';

const accountTypeIcons: Record<string, LucideIcon> = {
    bank: Landmark,
    wallet: Wallet,
    cash: Banknote,
    usd_account: DollarSign,
};

export default async function BanksPage() {
    const user = await requireUser();
    const t = await getTranslations('Banks');

    const [accounts, summary, transfers] = await Promise.all([
        fetchBankAccounts(),
        fetchBankLiquiditySummary(),
        fetchBankTransfers(),
    ]);

    // Métricas auxiliares
    const activeAccountsCount = accounts.filter(a => a.is_active).length;
    const usdAccountsCount = accounts.filter(a => a.currency === 'USD').length;

    const getAccountTypeLabel = (type: string) => {
        switch (type) {
            case 'bank':
                return t('typeTraditional');
            case 'wallet':
                return t('typeWallet');
            case 'cash':
                return t('typeCash');
            case 'usd_account':
                return t('typeUSD');
            default:
                return type;
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen text-foreground">
            {/* 1. Hero Banner with tweakcn aesthetics (Unified Header + KPIs container) */}
            <div className="rounded-[var(--radius)] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm border border-border bg-card relative overflow-hidden">
                {/* Subtle background glow effect */}
                <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

                {/* Banner Top Bar: Title & Controls */}
                <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between pb-6 border-b border-border relative z-10">
                    <div className="space-y-1.5 w-full xl:w-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary/40 dark:bg-secondary/20 text-secondary-foreground mb-1 border border-border">
                            <Sparkles className="w-3.5 h-3.5 text-accent dark:text-secondary-foreground" />
                            <span>{t('badge')}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground/80 font-sans">
                            {t('title')}
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                            {t('description')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <CreateAccountModal />
                        <TransferModal accounts={accounts} />
                    </div>
                </div>

                {/* KPIs Grid: 1 column on < lg, 3 columns on lg+ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pt-6 relative z-10">
                    <TranslucentImpactCard
                        title={t('totalLiquidityARS')}
                        value={formatCurrency(summary.totalARS)}
                        subtitle={t('liquiditySubtitleARS')}
                        trend={t('inPesos')}
                        icon={Banknote}
                    />

                    <TranslucentImpactCard
                        title={t('totalReserveUSD')}
                        value={`US$ ${summary.totalUSD.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                        subtitle={usdAccountsCount > 0 ? t('accountsInUSD', { count: usdAccountsCount }) : t('intlSavings')}
                        trend={t('inDollars')}
                        icon={DollarSign}
                    />

                    <TranslucentImpactCard
                        title={t('activeAccounts')}
                        value={activeAccountsCount.toString()}
                        subtitle={t('accountsRegistered', { count: accounts.length })}
                        trend={t('operational')}
                        icon={Landmark}
                    />
                </div>
            </div>

            {/* 2. Grid de Cuentas Registradas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">{t('registeredAccounts')}</h2>
                        <p className="text-xs text-muted-foreground">{t('registeredAccountsSubtitle')}</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                        {accounts.length} {accounts.length === 1 ? t('accountCountSingular') : t('accountCountPlural')}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {accounts.map((acc) => {
                        const Icon = accountTypeIcons[acc.account_type] || Landmark;
                        const label = getAccountTypeLabel(acc.account_type);

                        return (
                            <div
                                key={acc.id}
                                className="group relative overflow-hidden rounded-[var(--radius)] p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between bg-card border border-border shadow-sm hover:shadow-md"
                            >
                                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[repeating-linear-gradient(45deg,#808080_0px_1px,transparent_1px_10px)] opacity-30 mask-[radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>

                                <div className="relative z-10">
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
                                                    {label}
                                                </p>
                                            </div>
                                        </div>

                                        <AccountBalanceModal account={acc} />
                                    </div>

                                    {/* Contenedor métrico del Saldo (Fondo gris oscuro con texto blanco al estilo del sistema) */}
                                    <div className="my-4 p-4 rounded-xl bg-card text-neutral-900/80 dark:bg-foreground/90 dark:border dark:border-zinc-800 shadow-xs flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-900/70 block">
                                                {t('reconciledBalance')}
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
                                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground relative z-10">
                                    <span className="flex items-center gap-1.5">
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            acc.is_active ? "bg-emerald-500" : "bg-zinc-400"
                                        )} />
                                        <span>{acc.is_active ? t('activeForReceiving') : t('inactive')}</span>
                                    </span>

                                    <span className="text-[11px] font-mono text-muted-foreground/80">
                                        {acc.currency === 'USD' ? t('foreignCurrency') : t('localCurrency')}
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
                        <h2 className="text-lg font-bold text-foreground">{t('movementsTitle')}</h2>
                        <p className="text-xs text-muted-foreground">{t('movementsSubtitle')}</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                        {transfers.length} {transfers.length === 1 ? t('movementCountSingular') : t('movementCountPlural')}
                    </span>
                </div>

                <TransfersTable transfers={transfers} />
            </div>
        </div>
    );
}
