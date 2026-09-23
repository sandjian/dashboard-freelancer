import * as React from "react";
import { cn } from "@/lib/utils";
import { CardNetworkLogo } from "@/components/dashboard/finances/cards/card-network-logo";
import { CardNetwork, detectCardNetwork } from "@/lib/card-detection";

// Realistic EMV Chip matching user reference
function EmvChip() {
    const gradientId = React.useId();

    return (
        <svg
            aria-hidden="true"
            className="h-[24px] w-[32px] sm:h-[26px] sm:w-[34px] shrink-0"
            fill="none"
            viewBox="0 0 34 26"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>EMV Chip</title>
            <defs>
                <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f4e3ab" />
                    <stop offset="45%" stopColor="#c9a544" />
                    <stop offset="100%" stopColor="#8f6f22" />
                </linearGradient>
            </defs>
            <rect
                fill={`url(#${gradientId})`}
                height="25"
                rx="4.5"
                stroke="rgba(0,0,0,0.25)"
                width="33"
                x="0.5"
                y="0.5"
            />
            <g stroke="rgba(0,0,0,0.32)" strokeWidth="1">
                <path d="M0 8.5H11" />
                <path d="M0 17.5H11" />
                <path d="M23 8.5H34" />
                <path d="M23 17.5H34" />
                <path d="M11 3.5V22.5" />
                <path d="M23 3.5V22.5" />
                <path d="M11 13H23" />
            </g>
        </svg>
    );
}

// Contactless glyph matching user reference
function ContactlessGlyph() {
    return (
        <svg
            aria-hidden="true"
            className="h-[18px] w-[18px] shrink-0 text-white/75"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>Contactless</title>
            <path d="M5.5 9.4a5.4 5.4 0 0 1 0 5.2" />
            <path d="M9.2 7a9.4 9.4 0 0 1 0 10" />
            <path d="M12.9 4.7a13.4 13.4 0 0 1 0 14.6" />
        </svg>
    );
}


// --- PROPS INTERFACE ---
export interface FlippableCreditCardProps extends React.HTMLAttributes<HTMLDivElement> {
    cardholderName?: string;
    cardNumber?: string; // Expected formatted or raw string
    expiryDate?: string; // "MM/YY"
    cvv?: string;
    gradientClass?: string;
    brand?: CardNetwork;
    flipped?: boolean; // Manual flip control
    flipOnHover?: boolean; // Flip on container hover
    customFooter?: React.ReactNode;
    customBack?: React.ReactNode;
    bankName?: string;
}

export const FlippableCreditCard = React.forwardRef<HTMLDivElement, FlippableCreditCardProps>(
    (
        {
            className,
            cardholderName,
            cardNumber,
            expiryDate,
            cvv,
            gradientClass,
            brand,
            flipped = false,
            flipOnHover = false,
            customFooter,
            customBack,
            bankName,
            ...props
        },
        ref
    ) => {
        // Detect brand automatically if not explicitly provided
        const detectedNetwork = brand || detectCardNetwork(cardNumber || "").network;

        return (
            <div
                className={cn(
                    "group/flip h-[200px] md:h-[225px] w-full max-w-[400px] [perspective:1000px]",
                    className
                )}
                ref={ref}
                {...props}
            >
                {/* Inner 3D Container */}
                <div
                    className={cn(
                        "relative h-full w-full rounded-[16px] shadow-xl transition-transform duration-700 [transform-style:preserve-3d]",
                        flipOnHover ? "group-hover/flip:[transform:rotateY(180deg)]" : "",
                        flipped ? "[transform:rotateY(180deg)]" : ""
                    )}
                >
                    {/* --- CARD FRONT --- */}
                    <div
                        className={cn(
                            "absolute inset-0 h-full w-full rounded-[16px] text-white [backface-visibility:hidden] overflow-hidden p-5 sm:p-6 flex flex-col justify-between border border-white/15 transition-all duration-300 shadow-2xl bg-gradient-to-br grayscale-[0.3] group-hover/flip:grayscale-0",
                            gradientClass || "from-zinc-800 via-zinc-900 to-zinc-950"
                        )}
                    >
                        {/* Realistic printed grain overlay */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
                        />

                        {/* Specular sheen / gloss effect */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent" />
                        <div className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-white/[0.04] blur-2xl" />

                        {/* Crisp inner rim highlight */}
                        <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-white/15 ring-inset" />

                        {/* Top Row: Bank/Alias + EMV Chip & Contactless */}
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-0.5">
                                <span className="text-[9px] uppercase tracking-[0.14em] font-mono text-white/70 block">
                                    CREDIT CARD
                                </span>
                                <h4 className="font-semibold text-sm tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate max-w-[210px]">
                                    {bankName || cardholderName || "Mi Tarjeta"}
                                </h4>
                            </div>

                            {/* Realistic EMV Chip + Contactless Glyph */}
                            <div className="flex items-center gap-2.5">
                                <ContactlessGlyph />
                                <EmvChip />
                            </div>
                        </div>

                        {/* Middle Row: Card Number with enhanced contrast and drop shadow */}
                        <div className="relative z-10 my-auto pt-1">
                            <div className="font-mono text-base sm:text-[18px] tracking-[0.2em] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] select-none">
                                {cardNumber || "•••• •••• •••• ••••"}
                            </div>
                        </div>

                        {/* Bottom Row: Holder + Expiry (Left) & Network Logo (Right) */}
                        {customFooter ? (
                            <div className="relative z-10">{customFooter}</div>
                        ) : (
                            <div className="relative z-10 flex justify-between items-end gap-3">
                                <div className="flex gap-6 items-end">
                                    <div className="uppercase">
                                        <span className="text-[8px] text-white/70 block font-mono tracking-[0.14em] mb-0.5">
                                            CARDHOLDER
                                        </span>
                                        <span className="font-medium text-xs tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate max-w-[140px] block">
                                            {cardholderName || "TITULAR"}
                                        </span>
                                    </div>

                                    {expiryDate && (
                                        <div className="uppercase">
                                            <span className="text-[8px] text-white/70 block font-mono tracking-[0.14em] mb-0.5">
                                                EXPIRES
                                            </span>
                                            <span className="font-mono font-medium text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] block">
                                                {expiryDate}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 flex items-center justify-end">
                                    <CardNetworkLogo network={detectedNetwork} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- CARD BACK --- */}
                    <div
                        className={cn(
                            "absolute inset-0 h-full w-full rounded-[16px] text-white [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden border border-white/15 flex flex-col justify-between transition-all duration-300 shadow-2xl bg-gradient-to-br grayscale-[0.2] group-hover/flip:grayscale-0",
                            gradientClass || "from-zinc-800 via-zinc-900 to-zinc-950"
                        )}
                    >
                        {/* Specular sheen / gloss on back */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent" />
                        <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-white/15 ring-inset" />



                        {/* Custom Back Content (Buttons / Actions / Info) */}
                        {customBack ? (
                            <div className="flex-1 flex flex-col justify-between p-4 relative z-10">
                                {customBack}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-between p-4 relative z-10">
                                <div className="space-y-1">
                                    <div className="h-6 w-3/4 bg-white/15 rounded-xs flex items-center px-2">
                                        <span className="text-[9px] font-mono text-white/50 tracking-wider">FIRMA AUTORIZADA</span>
                                    </div>
                                </div>
                                <div className="text-[8px] font-mono text-white/60 tracking-wider">
                                    ESTA TARJETA ES INTRANSFERIBLE
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

FlippableCreditCard.displayName = "FlippableCreditCard";

