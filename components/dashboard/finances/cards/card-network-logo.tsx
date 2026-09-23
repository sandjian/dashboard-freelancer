import React from 'react';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardNetwork } from '@/lib/card-detection';

interface CardNetworkLogoProps {
    network: CardNetwork;
    className?: string;
}

export function CardNetworkLogo({ network, className }: CardNetworkLogoProps) {
    switch (network) {
        case 'visa':
            return (
                <svg
                    viewBox="0 0 48 16"
                    className={cn("h-6 w-auto fill-current text-white/90", className)}
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Visa"
                >
                    <path d="M18.87 0.44L12.35 15.56H8.08L4.93 3.7C4.74 2.97 4.57 2.7 4.02 2.37C3.12 1.83 1.63 1.34 0.32 1.05L0.4 0.44H7.13C8.02 0.44 8.81 1.04 9 2.06L10.72 11.23L14.88 0.44H18.87ZM35.48 10.59C35.5 6.55 29.89 6.33 29.93 4.54C29.94 4 30.45 3.42 31.55 3.28C32.09 3.21 33.6 3.15 35.52 4.05L36.23 0.77C35.26 0.42 34.02 0.08 32.46 0.08C28.46 0.08 25.64 2.2 25.61 5.25C25.58 7.5 27.6 8.76 29.13 9.51C30.7 10.28 31.23 10.77 31.22 11.45C31.2 12.5 29.96 12.96 28.82 12.98C26.8 13.01 25.62 12.43 24.69 11.99L23.95 15.42C24.9 15.86 26.66 16.24 28.48 16.26C32.74 16.26 35.47 14.16 35.48 10.59ZM46.03 15.56H49.52L46.46 0.44H43.25C42.52 0.44 41.91 0.86 41.65 1.5L35.58 15.56H39.81L40.66 13.22H45.83L46.03 15.56ZM41.82 10.04L43.92 4.28L45.13 10.04H41.82ZM24.78 0.44L21.43 15.56H17.43L20.78 0.44H24.78Z" />
                </svg>
            );

        case 'mastercard':
            return (
                <svg
                    viewBox="0 0 38 24"
                    className={cn("h-6 w-auto", className)}
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Mastercard"
                >
                    <circle cx="12" cy="12" r="11" fill="currentColor" fillOpacity="0.4" className="text-white" />
                    <circle cx="26" cy="12" r="11" fill="currentColor" fillOpacity="0.6" className="text-white" />
                    <path
                        d="M19 4.8C16.9 6.7 15.6 9.2 15.6 12C15.6 14.8 16.9 17.3 19 19.2C21.1 17.3 22.4 14.8 22.4 12C22.4 9.2 21.1 6.7 19 4.8Z"
                        fill="currentColor"
                        fillOpacity="0.9"
                        className="text-white"
                    />
                </svg>
            );

        case 'amex':
            return (
                <div
                    className={cn(
                        "h-6 px-1.5 py-0.5 rounded border border-white/40 flex items-center justify-center font-black tracking-tighter text-[10px] text-white/90 bg-white/10 uppercase select-none font-sans",
                        className
                    )}
                    aria-label="American Express"
                >
                    AMEX
                </div>
            );

        case 'generic':
        default:
            return (
                <CreditCard className={cn("h-6 w-6 text-white/70", className)} aria-label="Tarjeta" />
            );
    }
}
