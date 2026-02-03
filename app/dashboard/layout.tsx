'use client';

/**
 * Dashboard Layout - Protected wrapper with navigation
 */

import { useRequireAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, isLoading, logout } = useRequireAuth();
    const pathname = usePathname();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useRequireAuth
    }

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/generate', label: 'Generate' },
    ];

    return (
        <div className="min-h-screen">
            {/* Navigation Header */}
            <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">ClothFit</span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${pathname === link.href
                                        ? 'bg-violet-500/20 text-violet-400'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">{user.email}</span>
                        <button
                            onClick={logout}
                            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        </div>
    );
}
