import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const userRes = await sql`
    SELECT name, COALESCE(onboarding_completed, false) AS onboarding_completed
    FROM users
    WHERE id = ${session.user.id}
    LIMIT 1
  `;

  if (userRes.rows[0]?.onboarding_completed) {
    redirect(`/${locale}/dashboard`);
  }

  return <OnboardingWizard userName={userRes.rows[0]?.name || session.user.name} />;
}

