"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createCard } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { FlippableCreditCard } from "@/components/ui/flippable-card";
import { detectCardNetwork, formatCardNumberByNetwork } from "@/lib/card-detection";
import { CardNetworkLogo } from "./card-network-logo";

type ExtendedProps = {
    className?: string;
    onSuccess?: () => void;
};

const METALLIC_GRADIENTS: Record<string, { label: string; gradient: string }> = {
    slate: { label: "Titanio", gradient: "from-zinc-800 via-zinc-900 to-zinc-950" },
    zinc: { label: "Platino", gradient: "from-slate-700 via-zinc-800 to-zinc-900" },
    blue: { label: "Zafiro", gradient: "from-slate-900 via-blue-950 to-zinc-950" },
    emerald: { label: "Esmeralda", gradient: "from-zinc-900 via-emerald-950 to-zinc-950" },
    purple: { label: "Amatista", gradient: "from-zinc-900 via-purple-950 to-zinc-950" },
    gold: { label: "Oro Negro", gradient: "from-zinc-900 via-amber-950 to-zinc-950" },
    rose: { label: "Rose Gold", gradient: "from-zinc-900 via-rose-950 to-zinc-950" },
};

export function CreditCardForm({ className, onSuccess }: ExtendedProps) {
    const router = useRouter();

    // Card State
    const [cardName, setCardName] = useState("");
    const [rawNumber, setRawNumber] = useState("");
    const [holder, setHolder] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [cvv, setCVV] = useState("");
    const [closingDay, setClosingDay] = useState("");
    const [dueDay, setDueDay] = useState("");
    const [cardColor, setCardColor] = useState("slate");

    const [focusField, setFocusField] = useState<null | "number" | "holder" | "expire" | "cvv">(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Network Detection based on raw input
    const networkDetails = useMemo(() => detectCardNetwork(rawNumber), [rawNumber]);

    // Handle number formatting with max length clamp per network
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value.replace(/\D/g, "");
        const network = detectCardNetwork(cleaned);
        const clamped = cleaned.slice(0, network.maxLength);
        setRawNumber(clamped);
    };

    const formattedNumber = useMemo(() => {
        return formatCardNumberByNetwork(rawNumber, networkDetails.network);
    }, [rawNumber, networkDetails.network]);

    const years = useMemo(() => {
        const start = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, i) => String(start + i));
    }, []);

    const validity = useMemo(() => {
        const numberValid = rawNumber.length >= (networkDetails.network === "amex" ? 15 : 13);
        const holderValid = holder.trim().length >= 2;
        const monthValid = !!month;
        const yearValid = !!year;
        const cvvValid = rawNumber.length > 0 && cvv.length >= networkDetails.cvvLength;

        return {
            number: numberValid,
            holder: holderValid,
            month: monthValid,
            year: yearValid,
            cvv: cvvValid,
            allValid: numberValid && holderValid && monthValid && yearValid && cvvValid,
        };
    }, [rawNumber, holder, month, year, cvv, networkDetails]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setServerError(null);

        if (!validity.allValid || !closingDay || !dueDay || !cardName) {
            let errorMsg = "Por favor complete todos los campos requeridos.";
            if (!cardName) errorMsg = "Falta el nombre o alias de la tarjeta.";
            else if (!validity.number) errorMsg = `Número de tarjeta incompleto (mínimo ${networkDetails.maxLength} dígitos).`;
            else if (!validity.holder) errorMsg = "Nombre del titular requerido.";
            else if (!validity.month || !validity.year) errorMsg = "Fecha de vencimiento incompleta.";
            else if (!validity.cvv) errorMsg = `CVV inválido (${networkDetails.cvvLength} dígitos requeridos).`;
            else if (!closingDay) errorMsg = "Falta el día de cierre del resumen.";
            else if (!dueDay) errorMsg = "Falta el día de vencimiento.";

            setServerError(errorMsg);
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("name", cardName);
        formData.append("last_four_digits", rawNumber.slice(-4));
        formData.append("closing_day", closingDay);
        formData.append("due_day", dueDay);
        formData.append("color", cardColor);

        try {
            const result = await createCard({ message: "", errors: {} }, formData);

            if (result?.errors && Object.keys(result.errors).length > 0) {
                setServerError("Error de validación: Revise los campos (Día debe ser entre 1 y 31).");
                setIsSubmitting(false);
                return;
            }
            if (result?.message && !result.message.includes("éxito")) {
                setServerError(result.message);
                setIsSubmitting(false);
                return;
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/dashboard/finances/cards");
                router.refresh();
            }
        } catch (err: unknown) {
            const isRedirect =
                (err instanceof Error && err.message === "NEXT_REDIRECT") ||
                (typeof err === "object" && err !== null && "digest" in err && String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT"));

            if (isRedirect) {
                if (onSuccess) onSuccess();
                else router.push("/dashboard/finances/cards");
                return;
            }

            console.error("Failed to create card", err);
            setServerError("Ocurrió un error al registrar la tarjeta. Inténtelo nuevamente.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-8 w-full max-w-4xl mx-auto", className)}>
            {/* Realtime Interactive Preview */}
            <div className="w-full flex justify-center py-2">
                <FlippableCreditCard
                    bankName={cardName || "Banco / Entidad"}
                    cardholderName={holder || "TITULAR DE TARJETA"}
                    cardNumber={formattedNumber || "•••• •••• •••• ••••"}
                    expiryDate={`${month || "MM"}/${year ? year.slice(-2) : "AA"}`}
                    cvv={cvv}
                    brand={networkDetails.network}
                    gradientClass={METALLIC_GRADIENTS[cardColor]?.gradient || METALLIC_GRADIENTS.slate.gradient}
                    flipped={focusField === "cvv"}
                    className="w-full max-w-[420px]"
                />
            </div>

            {/* Input Form with tweakcn design */}
            <form
                className="w-full max-w-[620px] grid gap-6 bg-card p-6 md:p-8 rounded-[var(--radius)] border border-border shadow-sm"
                onSubmit={handleSubmit}
            >
                {serverError && (
                    <div className="p-3 text-xs font-medium rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                        {serverError}
                    </div>
                )}

                {/* Color Selector */}
                <div className="space-y-3 pb-4 border-b border-border">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                            Acabado de la Tarjeta
                        </label>
                        <span className="text-xs font-medium text-foreground">
                            {METALLIC_GRADIENTS[cardColor]?.label}
                        </span>
                    </div>
                    <div className="flex gap-2.5 flex-wrap pt-1">
                        {Object.entries(METALLIC_GRADIENTS).map(([key, item]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setCardColor(key)}
                                className={cn(
                                    "w-8 h-8 rounded-full bg-gradient-to-br border border-white/20 shadow-xs transition-all cursor-pointer hover:scale-110",
                                    item.gradient,
                                    cardColor === key ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110" : "opacity-75 hover:opacity-100"
                                )}
                                title={item.label}
                                aria-label={`Seleccionar color ${item.label}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Card Name / Alias */}
                <div className="space-y-2">
                    <label htmlFor="card_alias" className="text-sm font-medium text-foreground">
                        Nombre o Alias de la Tarjeta
                    </label>
                    <input
                        id="card_alias"
                        name="card_alias"
                        maxLength={50}
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Ej. Santander Black, Galicia Visa Gold"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                    />
                </div>

                {/* Card Number with Live BIN Detection Badge */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="card_number" className="text-sm font-medium text-foreground">
                            Número de Tarjeta
                        </label>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/40 border border-border">
                            <CardNetworkLogo network={networkDetails.network} className="h-3.5 w-auto" />
                            <span className="text-[11px] font-mono text-muted-foreground uppercase">
                                {networkDetails.name}
                            </span>
                        </div>
                    </div>
                    <input
                        id="card_number"
                        name="card_number"
                        maxLength={networkDetails.maxLength + (networkDetails.network === "amex" ? 2 : 3)}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono tracking-widest placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="•••• •••• •••• ••••"
                        value={formattedNumber}
                        onChange={handleNumberChange}
                        onFocus={() => setFocusField("number")}
                        onBlur={() => setFocusField(null)}
                    />
                </div>

                {/* Cardholder */}
                <div className="space-y-2">
                    <label htmlFor="card_holder" className="text-sm font-medium text-foreground">
                        Nombre del Titular (Como figura en el plástico)
                    </label>
                    <input
                        id="card_holder"
                        name="card_holder"
                        maxLength={50}
                        autoComplete="off"
                        data-lpignore="true"
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm uppercase placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                        placeholder="NOMBRE COMPLETO"
                        value={holder}
                        onChange={(e) => setHolder(e.target.value.toUpperCase())}
                        onFocus={() => setFocusField("holder")}
                        onBlur={() => setFocusField(null)}
                    />
                </div>

                {/* Expiration & CVV */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <label htmlFor="card_month" className="text-xs font-semibold text-muted-foreground font-mono uppercase">
                            Mes Venc.
                        </label>
                        <select
                            id="card_month"
                            name="card_month"
                            autoComplete="off"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            onFocus={() => setFocusField("expire")}
                            onBlur={() => setFocusField(null)}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-2.5 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                        >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="card_year" className="text-xs font-semibold text-muted-foreground font-mono uppercase">
                            Año Venc.
                        </label>
                        <select
                            id="card_year"
                            name="card_year"
                            autoComplete="off"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            onFocus={() => setFocusField("expire")}
                            onBlur={() => setFocusField(null)}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-2.5 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                        >
                            <option value="">AAAA</option>
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="card_cvv" className="text-xs font-semibold text-muted-foreground font-mono uppercase">
                            CVV ({networkDetails.cvvLength})
                        </label>
                        <input
                            id="card_cvv"
                            name="card_cvv"
                            maxLength={networkDetails.cvvLength}
                            type="password"
                            inputMode="numeric"
                            autoComplete="new-password"
                            data-lpignore="true"
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono tracking-widest placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder={"•".repeat(networkDetails.cvvLength)}
                            value={cvv}
                            onChange={(e) => setCVV(e.target.value.replace(/\D/g, "").slice(0, networkDetails.cvvLength))}
                            onFocus={() => setFocusField("cvv")}
                            onBlur={() => setFocusField(null)}
                        />
                    </div>
                </div>

                {/* Billing Cycle (Cierre y Vencimiento) */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div className="space-y-2">
                        <label htmlFor="closing_day" className="text-sm font-medium text-foreground">
                            Día de Cierre
                        </label>
                        <input
                            id="closing_day"
                            name="closing_day"
                            type="number"
                            min="1"
                            max="31"
                            autoComplete="off"
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Ej. 24"
                            value={closingDay}
                            onChange={(e) => setClosingDay(e.target.value)}
                        />
                        <span className="text-[11px] text-muted-foreground block">
                            Día en que corta el período
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="due_day" className="text-sm font-medium text-foreground">
                            Día de Vencimiento
                        </label>
                        <input
                            id="due_day"
                            name="due_day"
                            type="number"
                            min="1"
                            max="31"
                            autoComplete="off"
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Ej. 5"
                            value={dueDay}
                            onChange={(e) => setDueDay(e.target.value)}
                        />
                        <span className="text-[11px] text-muted-foreground block">
                            Día límite para pagar el resumen
                        </span>
                    </div>
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 mt-2 bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground dark:text-background font-semibold rounded-xl border border-border shadow-sm cursor-pointer transition-all duration-200"
                >
                    {isSubmitting ? "Registrando..." : "Guardar Tarjeta"}
                </Button>
            </form>
        </div>
    );
}
