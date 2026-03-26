'use client';

/**
 * ResultGrid Component
 *
 * Grid display for generated images with download, copy URL actions.
 * Supports batch mode with labeled results.
 */

import { useState, useCallback } from 'react';
import type { JobStatus } from '@/lib/api';

interface ResultGridProps {
    images: string[];
    status: JobStatus;
    errorMessage?: string | null;
    totalModels?: number;
}

export function ResultGrid({ images, status, errorMessage, totalModels }: ResultGridProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleDownload = useCallback(async (url: string, index: number) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `tryon-result-${index + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }, []);

    const handleCopyUrl = useCallback(async (url: string, index: number) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    }, []);

    const handleDownloadAll = useCallback(async () => {
        for (let i = 0; i < images.length; i++) {
            await handleDownload(images[i], i);
            // Small delay between downloads
            await new Promise((r) => setTimeout(r, 300));
        }
    }, [images, handleDownload]);

    if (status === 'pending' || status === 'processing') {
        const isBatch = totalModels && totalModels > 1;
        return (
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                    <p className="text-lg font-medium text-white">
                        {status === 'pending' ? 'Preparing generation...' : 'Generating images...'}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                        {isBatch
                            ? `Processing ${totalModels} body models concurrently (3 at a time). This may take a few minutes.`
                            : 'This may take up to a minute'}
                    </p>

                    {/* Progress indicator for batch */}
                    {isBatch && status === 'processing' && (
                        <div className="mt-4 w-full max-w-xs">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Processing...</span>
                                <span>{totalModels} models</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse"
                                    style={{ width: '60%' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-red-500/20 p-4">
                        <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-red-400">Generation Failed</p>
                    {errorMessage && (
                        <p className="mt-2 text-sm text-red-300">{errorMessage}</p>
                    )}
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return null;
    }

    const isBatch = images.length > 1;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                    Generated Images
                    {isBatch && (
                        <span className="ml-2 text-sm font-normal text-gray-400">
                            ({images.length} results)
                        </span>
                    )}
                </h3>
                {isBatch && (
                    <button
                        onClick={handleDownloadAll}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download All
                    </button>
                )}
            </div>

            {/* Warning for partial failures */}
            {errorMessage && status === 'completed' && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
                    ⚠️ {errorMessage}
                </div>
            )}

            <div className={`grid gap-4 ${images.length === 1
                    ? 'grid-cols-1'
                    : images.length <= 4
                        ? 'grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}>
                {images.map((url, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 transition-all hover:border-gray-700"
                    >
                        <img
                            src={url}
                            alt={`Generated result ${index + 1}`}
                            className="w-full object-cover"
                        />

                        {/* Body label */}
                        {isBatch && (
                            <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-gray-200 backdrop-blur-sm">
                                Body {index + 1}
                            </div>
                        )}

                        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex gap-2 p-4">
                                <button
                                    onClick={() => handleDownload(url, index)}
                                    className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </button>
                                <button
                                    onClick={() => handleCopyUrl(url, index)}
                                    className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                                >
                                    {copiedIndex === index ? (
                                        <>
                                            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy URL
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
