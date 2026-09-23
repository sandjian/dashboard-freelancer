"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- TYPES ---
export type PaymentMethodOption = {
    id: string;
    icon: React.ReactNode;
    label: string;
    description: string;
};

interface PaymentMethodSelectorProps {
    title?: string;
    actionText?: string;
    methods: PaymentMethodOption[];
    onActionClick?: () => void;
    value: string;
    onChange: (id: string) => void;
    className?: string;
}

// --- MAIN COMPONENT ---
export function PaymentMethodSelector({
    title,
    actionText,
    methods,
    onActionClick,
    value,
    onChange,
    className,
}: PaymentMethodSelectorProps) {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* Header */}
            {(title || actionText) && (
                <div className="flex items-center justify-between mb-2">
                    {title && <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{title}</h3>}
                    {actionText && (
                        <button
                            type="button"
                            onClick={onActionClick}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            {actionText}
                        </button>
                    )}
                </div>
            )}

            {/* Payment Methods List */}
            <motion.div
                className="grid grid-cols-1 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                role="radiogroup"
            >
                {methods.map((method) => {
                    const isSelected = value === method.id;
                    return (
                        <motion.div
                            key={method.id}
                            variants={itemVariants}
                            onClick={() => onChange(method.id)}
                            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onChange(method.id)}
                            className={cn(
                                "relative flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-300",
                                isSelected
                                    ? "bg-primary/5 border-primary/50 shadow-sm"
                                    : "bg-muted/20 border-transparent hover:bg-muted/30 hover:border-border"
                            )}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                        >
                            <div className={cn("flex-shrink-0 p-2 rounded-lg transition-colors", isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                {method.icon}
                            </div>

                            <div className="ml-3 flex-grow min-w-0">
                                <p className={cn("text-sm font-medium transition-colors", isSelected ? "text-primary" : "text-foreground")}>
                                    {method.label}
                                </p>
                                {method.description && (
                                    <p className="text-xs text-muted-foreground truncate">{method.description}</p>
                                )}
                            </div>

                            <div className={cn(
                                "ml-3 relative h-5 w-5 rounded-full border transition-all duration-300",
                                isSelected ? "border-primary" : "border-muted-foreground/30"
                            )}>
                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0, x: "-50%", y: "-50%" }}
                                            animate={{ scale: 1, x: "-50%", y: "-50%" }}
                                            exit={{ scale: 0, x: "-50%", y: "-50%" }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-1/2 left-1/2 h-2.5 w-2.5 rounded-full bg-primary shadow-sm"
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
