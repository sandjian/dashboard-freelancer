import { requireUser } from '@/lib/auth-guard';
import { fetchCardDetail, fetchBankAccounts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, CreditCard } from 'lucide-react';
import { CardStatementsTable } from '@/components/dashboard/finances/cards/card-statements-table';
import { CardStatementControl } from '@/components/dashboard/finances/cards/card-statement-sheet';
import { notFound } from 'next/navigation';

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const user = await requireUser();
    const { id: cardId } = await params;
    const sp = await searchParams;
    const now = new Date();
    const currentYear = Number(sp.year) || now.getFullYear();
    const currentMonth = Number(sp.month) || (now.getMonth() + 1);

    // Cargamos en paralelo el detalle de la tarjeta y las cuentas bancarias activas
    const [data, bankAccounts] = await Promise.all([
        fetchCardDetail(cardId, currentYear, currentMonth),
        fetchBankAccounts(),
    ]);

    if (!data) {
        notFound();
    }

    const { card, currentStatement, history } = data;

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('es-AR', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="w-full space-y-6 container mx-auto p-6 max-w-5xl animate-in fade-in duration-300">
            {/* NAVEGACIÓN SUPERIOR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/finances/cards">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-primary" />
                            {card.name}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Terminación ****{card.lastFourDigits || '----'} • Cierra el día {card.closingDay} • Vence el día {card.dueDay}
                        </p>
                    </div>
                </div>

                {/* NAVEGADOR DE PERÍODOS */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Link href={`/dashboard/finances/cards/${cardId}?year=${prevYear}&month=${prevMonth}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <span className="w-36 text-center font-medium capitalize text-sm">{monthName}</span>
                    <Link href={`/dashboard/finances/cards/${cardId}?year=${nextYear}&month=${nextMonth}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ESTADO DEL MES SELECCIONADO */}
            <div className="p-4 rounded-2xl border border-border bg-muted/20">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Estado de {monthName}
                </div>
                <CardStatementControl
                    cardId={card.id}
                    cardName={card.name}
                    dueDay={card.dueDay}
                    year={currentYear}
                    month={currentMonth}
                    statement={currentStatement}
                    accounts={bankAccounts}
                />
            </div>

            {/* HISTORIAL DE RESÚMENES MENSUALES */}
            <div className="space-y-3 pt-2">
                <h2 className="text-lg font-semibold text-foreground">Historial de Resúmenes Emitidos</h2>
                <CardStatementsTable statements={history} />
            </div>
        </div>
    );
}