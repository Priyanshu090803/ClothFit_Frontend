'use client';

/**
 * Register Page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerUser, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const registerSchema = z
    .object({
        email: z.string().email('Please enter a valid email'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setError(null);
        setIsLoading(true);

        try {
            await registerUser(data.email, data.password);
            await refreshUser(); // Update auth state before redirect
            router.push('/dashboard');
        } catch (err) {
            if (err instanceof ApiClientError) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create account</h1>
                    <p className="mt-2 text-gray-400">Get started with ClothFit</p>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">Email</label>
                            <input
                                type="email"
                                {...register('email')}
                                className={`w-full rounded-xl border bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 ${errors.email
                                    ? 'border-red-500/50 focus:ring-red-500'
                                    : 'border-gray-700 hover:border-gray-600 focus:border-violet-500 focus:ring-violet-500/20'
                                    }`}
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">Password</label>
                            <input
                                type="password"
                                {...register('password')}
                                className={`w-full rounded-xl border bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 ${errors.password
                                    ? 'border-red-500/50 focus:ring-red-500'
                                    : 'border-gray-700 hover:border-gray-600 focus:border-violet-500 focus:ring-violet-500/20'
                                    }`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">Confirm Password</label>
                            <input
                                type="password"
                                {...register('confirmPassword')}
                                className={`w-full rounded-xl border bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 ${errors.confirmPassword
                                    ? 'border-red-500/50 focus:ring-red-500'
                                    : 'border-gray-700 hover:border-gray-600 focus:border-violet-500 focus:ring-violet-500/20'
                                    }`}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
