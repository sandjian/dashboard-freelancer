import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InvoicesTableSkeleton() {
    return (
        <div className="h-full flex flex-col justify-between animate-pulse">
            <div className="w-full overflow-x-auto flex-1">
                <Table className="min-w-[650px]">
                    <TableHeader className="bg-muted/10 border-b border-border/30">
                        <TableRow className="border-border/30 hover:bg-transparent">
                            <TableHead className="py-3.5 pl-4 sm:pl-6 w-[140px]">
                                <div className="h-3 w-16 bg-muted/60 rounded" />
                            </TableHead>
                            <TableHead className="py-3.5">
                                <div className="h-3 w-20 bg-muted/60 rounded" />
                            </TableHead>
                            <TableHead className="py-3.5">
                                <div className="h-3 w-16 bg-muted/60 rounded" />
                            </TableHead>
                            <TableHead className="py-3.5 text-right pr-3 sm:pr-6">
                                <div className="h-3 w-16 bg-muted/60 rounded ml-auto" />
                            </TableHead>
                            <TableHead className="w-[44px] py-3.5 pr-3 sm:pr-6 text-right">
                                <div className="h-4 w-4 bg-muted/40 rounded ml-auto" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i} className="border-b border-border/20 hover:bg-transparent">
                                <TableCell className="py-3.5 pl-4 sm:pl-6">
                                    <div className="h-4 w-28 bg-muted/70 rounded" />
                                    <div className="h-3 w-16 bg-muted/40 rounded mt-1" />
                                </TableCell>
                                <TableCell className="py-3.5">
                                    <div className="h-3.5 w-20 bg-muted/50 rounded" />
                                </TableCell>
                                <TableCell className="py-3.5">
                                    <div className="h-5 w-16 bg-muted/60 rounded-full" />
                                </TableCell>
                                <TableCell className="py-3.5 text-right pr-3 sm:pr-6">
                                    <div className="h-4 w-24 bg-muted/70 rounded font-mono ml-auto" />
                                </TableCell>
                                <TableCell className="py-3.5 pr-3 sm:pr-6 text-right">
                                    <div className="h-7 w-7 bg-muted/40 rounded-md ml-auto" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination footer mirror */}
            <div className="p-4 border-t border-border/40 flex items-center justify-between">
                <div className="h-4 w-28 bg-muted/50 rounded" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-muted/40 rounded-lg" />
                    <div className="h-8 w-8 bg-muted/50 rounded-lg" />
                    <div className="h-8 w-8 bg-muted/40 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function ExpensesTableSkeleton() {
    return (
        <div className="h-full flex flex-col justify-between animate-pulse">
            <div className="w-full overflow-x-auto flex-1">
                <Table className="min-w-[650px]">
                    <TableHeader className="bg-muted/10 border-b border-border/30">
                        <TableRow className="border-border/30 hover:bg-transparent">
                            <TableHead className="py-3.5 pl-4 sm:pl-6 w-[85px]">
                                <div className="h-3 w-12 bg-muted/60 rounded" />
                            </TableHead>
                            <TableHead className="py-3.5">
                                <div className="h-3 w-20 bg-muted/60 rounded" />
                            </TableHead>
                            <TableHead className="hidden sm:table-cell py-3.5">
                                <div className="h-3 w-16 bg-muted/60 rounded" />
                            </TableHead>
                            <TableHead className="hidden md:table-cell py-3.5">
                                <div className="h-3 w-24 bg-muted/60 rounded" />
                            </TableHead>
                            <TableHead className="py-3.5">
                                <div className="h-3 w-14 bg-muted/60 rounded" />
                            </TableHead>
                            <TableHead className="text-right py-3.5 pr-3 sm:pr-6">
                                <div className="h-3 w-16 bg-muted/60 rounded ml-auto" />
                            </TableHead>
                            <TableHead className="w-[44px] py-3.5 pr-3 sm:pr-6 text-right">
                                <div className="h-4 w-4 bg-muted/40 rounded ml-auto" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i} className="border-b border-border/20 hover:bg-transparent">
                                <TableCell className="py-3.5 pl-4 sm:pl-6">
                                    <div className="h-3.5 w-12 bg-muted/50 rounded font-mono" />
                                </TableCell>
                                <TableCell className="py-3.5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-36 bg-muted/70 rounded" />
                                        <div className="h-4 w-4 bg-muted/40 rounded-full" />
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell py-3.5">
                                    <div className="h-3.5 w-20 bg-muted/50 rounded" />
                                </TableCell>
                                <TableCell className="hidden md:table-cell py-3.5">
                                    <div className="h-3.5 w-24 bg-muted/50 rounded" />
                                </TableCell>
                                <TableCell className="py-3.5">
                                    <div className="h-5 w-16 bg-muted/60 rounded-full" />
                                </TableCell>
                                <TableCell className="text-right py-3.5 pr-3 sm:pr-6">
                                    <div className="h-4 w-20 bg-muted/70 rounded font-mono ml-auto" />
                                </TableCell>
                                <TableCell className="py-3.5 pr-3 sm:pr-6 text-right">
                                    <div className="h-7 w-7 bg-muted/40 rounded-md ml-auto" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination footer mirror */}
            <div className="p-4 border-t border-border/40 flex items-center justify-between">
                <div className="h-4 w-28 bg-muted/50 rounded" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-muted/40 rounded-lg" />
                    <div className="h-8 w-8 bg-muted/50 rounded-lg" />
                    <div className="h-8 w-8 bg-muted/40 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
