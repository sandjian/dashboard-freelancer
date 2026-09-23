import { Header } from "@/components/dashboard/header";
import SideNav from "@/components/dashboard/sidenav";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-zinc-100/70 dark:bg-[#07090c] relative selection:bg-teal-500/20 selection:text-teal-900 dark:selection:text-teal-200">
      {/* Ambient background glows for both light and dark modes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Subtle teal-cyan radial accent at top right */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-teal-500/10 dark:bg-teal-950/25 blur-3xl" />
        {/* Deep dark / soft undertone at bottom left */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/5 dark:bg-teal-900/10 blur-3xl" />
      </div>

      <div className="w-full flex-none md:w-72 relative z-10">
        <SideNav user={session?.user} />
      </div>
      <div className="flex-grow flex flex-col md:overflow-y-auto relative z-10">
        <Header user={session?.user} />
        <div className="flex-grow p-6 md:p-8">
          {children}
        </div>
        <Toaster />
      </div>
    </div>
  );
}