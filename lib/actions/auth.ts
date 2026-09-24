'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciales inválidas.';
                default:
                    return 'Algo salió mal.';
            }
        }
        throw error;
    }
}

export async function loginWithGoogle() {
    await signIn('google', { redirectTo: '/dashboard' });
}

export async function loginWithDemo() {
    await signIn('credentials', {
        email: 'demo@avalon.com',
        password: 'demo1234',
        redirectTo: '/dashboard',
    });
}

