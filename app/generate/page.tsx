'use client';

/**
 * Generate Page - Main try-on generation interface
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateTryon, pollJobUntilComplete, type TryonJobResponse } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { UploadField } from '@/components/UploadField';
import { ResolutionSelect } from '@/components/ResolutionSelect';
import { AspectSelect } from '@/components/AspectSelect';
import { ImageCountSelect } from '@/components/ImageCountSelect';
import { ResultGrid } from '@/components/ResultGrid';

const generateSchema = z.object({
    aspectRatio: z.string(),
    resolution: z.string(),
    imageCount: z.number().min(1).max(4),
    prompt: z.string().optional(),
});

type GenerateForm = z.infer<typeof generateSchema>;

export default function GeneratePage() {
    const { isLoading: authLoading } = useRequireAuth();
    const router = useRouter();

    const [modelPhoto, setModelPhoto] = useState<File | null>(null);
    const [clothPhoto, setClothPhoto] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentJob, setCurrentJob] = useState<TryonJobResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<GenerateForm>({
        resolver: zodResolver(generateSchema),
        defaultValues: {
            aspectRatio: '3:4',
            resolution: '1K',
            imageCount: 1,
            prompt: '',
        },
    });

    const onSubmit = useCallback(
        async (data: GenerateForm) => {
            if (!modelPhoto || !clothPhoto) {
                setError('Please upload both model and clothing photos');
                return;
            }

            setError(null);
            setIsGenerating(true);
            setCurrentJob(null);

            try {
                const job = await generateTryon(
                    modelPhoto,
                    clothPhoto,
                    data.aspectRatio,
                    data.resolution,
                    data.imageCount,
                    data.prompt
                );

                setCurrentJob(job);

                // Poll for completion
                const completedJob = await pollJobUntilComplete(job.id, (updatedJob) => {
                    setCurrentJob(updatedJob);
                });

                setCurrentJob(completedJob);
            } catch (err) {
                console.error('Generation failed:', err);
                setError(err instanceof Error ? err.message : 'Generation failed');
            } finally {
                setIsGenerating(false);
            }
        },
        [modelPhoto, clothPhoto]
    );

    const handleReset = useCallback(() => {
        setModelPhoto(null);
        setClothPhoto(null);
        setCurrentJob(null);
        setError(null);
    }, []);

    if (authLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Generate Try-On</h1>
                <p className="mt-2 text-gray-400">
                    Upload a model photo and clothing item to generate realistic try-on images
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left: Form */}
                <div className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Upload Fields */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <UploadField
                                label="Model Photo"
                                onChange={setModelPhoto}
                            />
                            <UploadField
                                label="Clothing Photo"
                                onChange={setClothPhoto}
                            />
                        </div>

                        {/* Settings */}
                        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-white">Generation Settings</h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <Controller
                                    name="aspectRatio"
                                    control={control}
                                    render={({ field }) => (
                                        <AspectSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.aspectRatio?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="resolution"
                                    control={control}
                                    render={({ field }) => (
                                        <ResolutionSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.resolution?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="imageCount"
                                    control={control}
                                    render={({ field }) => (
                                        <ImageCountSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.imageCount?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Custom Prompt */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200">
                                    Custom Prompt (Optional)
                                </label>
                                <Controller
                                    name="prompt"
                                    control={control}
                                    render={({ field }) => (
                                        <textarea
                                            {...field}
                                            rows={3}
                                            placeholder="Add additional instructions for the generation..."
                                            className="w-full rounded-xl border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 hover:border-gray-600"
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isGenerating || !modelPhoto || !clothPhoto}
                                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Generating...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Generate Image
                                    </span>
                                )}
                            </button>

                            {currentJob && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-xl border border-gray-700 px-6 py-4 font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right: Results */}
                <div>
                    {currentJob ? (
                        <ResultGrid
                            images={currentJob.result_urls}
                            status={currentJob.status}
                            errorMessage={currentJob.error_message}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-800 p-12">
                            <div className="text-center">
                                <div className="mx-auto mb-4 rounded-full bg-gray-800 p-6">
                                    <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium text-gray-300">No results yet</p>
                                <p className="mt-2 text-sm text-gray-500">
                                    Upload photos and click Generate to see results
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
