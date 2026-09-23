"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedExpandableListProps<T> {
    items: T[];
    getKey: (item: T) => string;
    renderItem: (item: T, onClick: () => void) => React.ReactNode;
    renderDetail: (item: T, onClose: () => void) => React.ReactNode;
    emptyMessage?: string;
    title?: string;
    className?: string;
    onViewAll?: () => void;
    viewAllText?: string;
}

export function AnimatedExpandableList<T>({
    items,
    getKey,
    renderItem,
    renderDetail,
    emptyMessage = "No items",
    title,
    className,
    onViewAll,
    viewAllText = "View All"
}: AnimatedExpandableListProps<T>) {
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    if (items.length === 0) {
        return <p className="text-xs text-zinc-500">{emptyMessage}</p>;
    }

    return (
        <div className={cn("w-full font-sans", className)}>
            <motion.div
                layout
                className="w-full relative"
                initial={false}
                animate={{
                    // We let the height adjust automatically via layout
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
                <AnimatePresence mode="wait">
                    {!selectedItem ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                        >
                            {title && <h2 className="text-sm font-semibold text-zinc-400 mb-3">{title}</h2>}

                            <div className="space-y-2">
                                {items.map((item) => (
                                    <motion.div
                                        key={getKey(item)}
                                        layoutId={`card-${getKey(item)}`}
                                        onClick={() => setSelectedItem(item)}
                                        className="cursor-pointer"
                                    >
                                        {renderItem(item, () => setSelectedItem(item))}
                                    </motion.div>
                                ))}
                            </div>

                            {onViewAll && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onViewAll}
                                    className="flex w-full items-center justify-center rounded-lg bg-cyan-950/30 text-cyan-400 py-2 text-xs font-medium border border-cyan-900/50 mt-4 hover:bg-cyan-900/40 transition-colors"
                                >
                                    {viewAllText} <ArrowRight className="ml-2 h-3 w-3" />
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className=""
                        >
                            <div className="relative">
                                {/* Close button removed as requested */}
                                {renderDetail(selectedItem, () => setSelectedItem(null))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
