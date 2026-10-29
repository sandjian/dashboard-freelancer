import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/auth";
import { sql } from "@vercel/postgres";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  try {
    const userRes = await sql`
      SELECT COALESCE(onboarding_completed, false) AS onboarding_completed
      FROM users
      WHERE id = ${session.user.id}
      LIMIT 1
    `;
    if (userRes.rows.length > 0 && !userRes.rows[0].onboarding_completed) {
      redirect(`/${locale}/onboarding`);
    }
  } catch (err) {
    // Allow Next.js redirect exceptions to bubble up
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.error("Error verifying onboarding status in layout:", err);
  }

  return (
    <DashboardShell user={session?.user}>
      {children}
    </DashboardShell>
  );
}
