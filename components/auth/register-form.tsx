"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, AlertCircle, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { registerUser } from '@/lib/actions/register';

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
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
                        <span>GAIA</span>
                    </div>
                </div>

                <div className="relative z-20">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Join the Future of Freelancing</h2>
                    <p className="text-lg text-primary-foreground/80 max-w-md">
                        Manage your finances, track expenses, and grow your business with our intelligent dashboard.
                    </p>
                </div>

                <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
                    <span>© 2026 Gaia Inc.</span>
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
                        <span>GAIA</span>
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
                            className="w-full h-12 bg-background border-border/60 hover:bg-accent"
                            type="button"
                            onClick={() => { /* signIn('google') handled elsewhere/client-side usually */ }}
                        >
                            <Mail className="mr-2 size-5" />
                            Google
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-8">
                        Already have an account?{" "}
                        <Link href="/login" className="text-foreground font-medium hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
