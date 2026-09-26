import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CreditCardForm } from '@/components/dashboard/finances/cards/credit-card-form';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function CreateCardPage() {
    const [t, tCommon] = await Promise.all([
        getTranslations('Cards'),
        getTranslations('Common'),
    ]);

    return (
        <div className="p-4 sm:p-6 w-full max-w-[1200px] mx-auto space-y-8 min-h-screen text-foreground">
            {/* Header & Breadcrumb Container */}
            <div className="space-y-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                                {tCommon('dashboard')}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/finances/cards" className="text-muted-foreground hover:text-foreground">
                                {tCommon('cards')}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-foreground font-medium">{t('newCard')}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary/40 dark:bg-secondary/20 text-secondary-foreground mb-1 border border-border">
                            <Sparkles className="w-3.5 h-3.5 text-accent dark:text-secondary-foreground" />
                            <span>{t('cardOnboardingBadge')}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground/80 font-sans">
                            {t('registerNewCard')}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {t('registerNewCardDescription')}
                        </p>
                    </div>

                    <Link
                        href="/dashboard/finances/cards"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground transition-all duration-200 self-start sm:self-auto"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{t('backToCards')}</span>
                    </Link>
                </div>
            </div>

            {/* Interactive Form with Live Preview */}
            <div className="w-full">
                <CreditCardForm />
            </div>
        </div>
    );
}

