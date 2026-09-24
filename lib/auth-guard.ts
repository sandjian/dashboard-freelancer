import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Obtiene el usuario autenticado actual en Server Components o Server Actions.
 * Si no está autenticado o carece de ID, redirige automáticamente a /login.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return session.user as AuthenticatedUser;
}

/**
 * Obtiene el ID del usuario opcionalmente provisto como argumento,
 * o lo resuelve de la sesión activa si no se proporcionó.
 */
export async function resolveUserId(providedUserId?: string): Promise<string> {
  if (providedUserId) return providedUserId;
  const user = await requireUser();
  return user.id;
}
