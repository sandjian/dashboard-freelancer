import { fetchPendingRecurringTransactions } from "@/lib/data";
import { GlobalAlert } from "@/components/dashboard/generate-recurring";
import { MonthYearSelector } from "@/components/dashboard/month-year-selector";
import SideNav from "@/components/dashboard/sidenav";

 
export default async function Layout({ children }: { children: React.ReactNode }) {
    const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  // 👇 5. Buscamos las transacciones pendientes
  const pendingRecurring = await fetchPendingRecurringTransactions(year, month);
 
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
      <div className="flex justify-end mb-4">
          <MonthYearSelector />
      </div>
      <GlobalAlert 
          pendingTransactions={pendingRecurring}
          year={year}
          month={month}
        />
        {children}
        
      </div>
    </div>
  );
}