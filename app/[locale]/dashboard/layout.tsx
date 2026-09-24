import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <DashboardShell user={session?.user}>
      {children}
    </DashboardShell>
  );
}