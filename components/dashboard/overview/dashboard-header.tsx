import { format } from "date-fns";
import { es } from "date-fns/locale";

export function DashboardHeader() {
    const today = new Date();

    return (
        <div className="flex items-end justify-start mb-8">
            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Resumen General</p>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Salud Financiera</h1>
            </div>
        </div>
    );
}
