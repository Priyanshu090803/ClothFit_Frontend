'use client';

/**
 * Dashboard Page - Overview and recent history
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHistory, type TryonJobResponse } from '@/lib/api';

export default function DashboardPage() {
    const [recentJobs, setRecentJobs] = useState<TryonJobResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await getHistory(6, 0);
                setRecentJobs(data.jobs);
            } catch (error) {
                console.error('Failed to load history:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadHistory();
    }, []);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 p-8">
                <h1 className="text-3xl font-bold text-white">Welcome to ClothFit</h1>
                <p className="mt-2 text-lg text-gray-400">
                    Generate realistic virtual try-on images with AI
                </p>
                <Link
                    href="/generate"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Generation
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-violet-500/20 p-3">
                            <svg className="h-6 w-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Generations</p>
                            <p className="text-2xl font-bold text-white">{recentJobs.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-emerald-500/20 p-3">
                            <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Completed</p>
                            <p className="text-2xl font-bold text-white">
                                {recentJobs.filter((j) => j.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-amber-500/20 p-3">
                            <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Processing</p>
                            <p className="text-2xl font-bold text-white">
                                {recentJobs.filter((j) => j.status === 'processing' || j.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Generations */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Recent Generations</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                    </div>
                ) : recentJobs.length === 0 ? (
                    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
                        <div className="mx-auto mb-4 rounded-full bg-gray-800 p-4 w-fit">
                            <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-400">No generations yet</p>
                        <Link
                            href="/generate"
                            className="mt-4 inline-block text-violet-400 hover:text-violet-300"
                        >
                            Create your first generation →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {recentJobs.map((job) => (
                            <div
                                key={job.id}
                                className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 transition-all hover:border-gray-700"
                            >
                                {job.result_urls.length > 0 ? (
                                    <img
                                        src={job.result_urls[0]}
                                        alt="Generated result"
                                        className="aspect-[3/4] w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex aspect-[3/4] items-center justify-center bg-gray-800">
                                        {job.status === 'processing' || job.status === 'pending' ? (
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                                        ) : (
                                            <svg className="h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${job.status === 'completed'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : job.status === 'failed'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                }`}
                                        >
                                            {job.status}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
