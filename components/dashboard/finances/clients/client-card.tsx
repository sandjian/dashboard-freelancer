"use client";

import * as React from "react";
import { motion, Variants, HTMLMotionProps } from "framer-motion";
import {
    Building2,
    Mail,
    Phone,
    MoreHorizontal,
    FileText,
    AlertCircle,
    Clock
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ClientWithStats } from "@/lib/definitions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditClientModal } from "./edit-client-modal";
import { DeleteClientDialog } from "./delete-client-dialog";

interface ClientCardProps extends HTMLMotionProps<"div"> {
    client: ClientWithStats;
}

const cardVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
        scale: 1.02,
        transition: { duration: 0.3 },
    },
};

const contentVariants: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const ClientCard = React.forwardRef<HTMLDivElement, ClientCardProps>(
    ({ className, client, ...props }, ref) => {

        // Fallback logic for avatar
        const avatarName = client.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();


        return (
            <motion.div
                ref={ref}
                className={cn(
                    "relative w-full overflow-hidden rounded-2xl bg-card border border-border/50 shadow-md group",
                    className
                )}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                {...props}
            >
                {/* Banner Image */}
                <div className={cn("h-32 w-full opacity-90 transition-opacity group-hover:opacity-100")}>
                    <div className="w-full h-full " />
                </div>

                {/* Quick Actions (Dropdown) */}
                <div className="absolute right-4 top-4 z-20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-9 w-9 rounded-lg bg-background/20 backdrop-blur-md text-white hover:bg-background/40 border-0 shadow-sm"
                                aria-label="Opciones"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div onSelect={(e) => e.preventDefault()}>
                                <EditClientModal
                                    client={{
                                        ...client,
                                        email: client.email || undefined,
                                        brand: client.brand || undefined,
                                        phone: client.phone || undefined,
                                        image_url: client.image_url || undefined,
                                    }}
                                    trigger={
                                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                            Editar
                                        </div>
                                    }
                                />
                            </div>
                            <div onSelect={(e) => e.preventDefault()}>
                                <DeleteClientDialog
                                    clientId={client.id}
                                    clientName={client.name}
                                    trigger={
                                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 text-red-600 hover:text-red-700 w-full">
                                            Eliminar
                                        </div>
                                    }
                                />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Avatar (overlaps banner) */}
                <div className="absolute left-1/2 top-32 -translate-x-1/2 -translate-y-1/2">
                    <Avatar className="h-24 w-24 border-[4px] border-card shadow-lg">
                        {/* If we had client.image_url we would use it here */}
                        {/* <AvatarImage src={client.image_url} alt={client.name} /> */}
                        <AvatarFallback className="text-2xl font-bold bg-primary text-background dark:text-white">{avatarName}</AvatarFallback>
                    </Avatar>
                </div>

                {/* Content Area */}
                <motion.div
                    className="px-6 pb-6 pt-14 text-center"
                    variants={contentVariants}
                >
                    {/* Name & Title */}
                    <motion.div variants={itemVariants} className="space-y-1 mb-6">
                        <h2 className="text-xl font-bold text-card-foreground tracking-tight">
                            {client.name}
                        </h2>
                        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>{client.brand || "Cliente Independiente"}</span>
                        </div>

                        {/* Quick Contact Icons */}
                        <div className="flex justify-center gap-2 mt-3 opacity-80">
                            {client.email && (
                                <div className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-help" title={client.email}>
                                    <Mail className="w-3.5 h-3.5" />
                                </div>
                            )}
                            {client.phone && (
                                <div className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-help" title={client.phone}>
                                    <Phone className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>

                    </motion.div>

                    {/* Stats Section with Divider */}
                    <motion.div
                        className="my-6 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-muted/30 py-4"
                        variants={itemVariants}
                    >
                        <StatItem
                            icon={FileText}
                            value={client.total_invoices}
                            label="Facturas"
                            color="text-foreground"
                        />
                        <StatItem
                            icon={Clock}
                            value={client.pending_invoices}
                            label="Pendientes"
                            color={client.pending_invoices > 0 ? "text-amber-500" : "text-muted-foreground"}
                        />
                        <StatItem
                            icon={AlertCircle}
                            value={client.overdue_invoices}
                            label="Vencidas"
                            color={client.overdue_invoices > 0 ? "text-red-500" : "text-muted-foreground"}
                        />
                    </motion.div>

                    {/* Action Button */}
                    <motion.div variants={itemVariants}>
                        <Link href={`/dashboard/finances/clients/${client.id}`} className="w-full block">
                            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-xl py-6 font-semibold shadow-sm" size="lg">
                                Ver Perfil Completo
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    }
);
ClientCard.displayName = "ClientCard";

// Internal StatItem component
const StatItem = ({
    icon: Icon,
    value,
    label,
    color,
}: {
    icon?: React.ElementType;
    value: string | number;
    label: string;
    color?: string;
}) => (
    <div className="flex flex-col items-center justify-center px-2 text-center gap-1">
        <div className={cn("flex items-center gap-1.5 font-bold text-lg", color)}>
            {Icon && <Icon className="h-4 w-4 opacity-70" />}
            <span>{value}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">{label}</span>
    </div>
);
