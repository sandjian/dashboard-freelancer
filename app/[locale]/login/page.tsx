import InteractiveLoginForm from '@/components/auth/interactive-login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | Dashboard Freelancer',
};

export default function LoginPage() {
    return (
        <InteractiveLoginForm />
    );
}
