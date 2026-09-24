"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, AlertCircle, Mail, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { registerUser } from '@/lib/actions/register';
import { loginWithGoogle } from '@/lib/actions/auth';

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isGooglePending, startGoogleTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);

        // Basic client-side validation could go here

        try {
            const result = await registerUser(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                // Success! Redirecting... (Handled by server action usually, or we do it here)
                // If server action redirects, we might not get here unless we use a different pattern.
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Content Section */}
            <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground overflow-hidden">
                <div className="relative z-20">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="size-8 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="size-4" />
                        </div>
                        <span>AVALON</span>
                    </div>
                </div>

                <div className="relative z-20">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Join the Future of Freelancing</h2>
                    <p className="text-lg text-primary-foreground/80 max-w-md">
                        Manage your finances, track expenses, and grow your business with our intelligent dashboard.
                    </p>
                </div>

                <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
                    <span>© 2026 AVALON Inc.</span>
                </div>

                {/* Decorative elements */}
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
            </div>

            {/* Right Registration Section */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-[420px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-4 text-primary" />
                        </div>
                        <span>AVALON</span>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
                        <p className="text-muted-foreground text-sm">Enter your email below to create your account</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                required
                                className="h-12 bg-background border-border/60 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@example.com"
                                required
                                className="h-12 bg-background border-border/60 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="h-12 bg-background border-border/60 focus:border-primary"
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground mb-4">Or continue with</p>
                        <Button
                            variant="outline"
                            className="w-full h-12 bg-background border-border/60 hover:bg-accent cursor-pointer flex items-center justify-center gap-2"
                            type="button"
                            disabled={isGooglePending}
                            onClick={() => {
                                startGoogleTransition(async () => {
                                    await loginWithGoogle();
                                });
                            }}
                        >
                            {isGooglePending ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <svg className="size-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                            )}
                            <span>{isGooglePending ? "Conectando con Google..." : "Google"}</span>
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-8">
                        Already have an account?{" "}
                        <Link href="/login" className="text-foreground font-semibold hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
