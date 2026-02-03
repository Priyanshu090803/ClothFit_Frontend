'use client';

/**
 * UploadField Component
 * 
 * Drag & drop file upload with preview
 */

import { useCallback, useState } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface UploadFieldProps {
    label: string;
    accept?: string;
    maxSizeMB?: number;
    register?: UseFormRegisterReturn;
    error?: FieldError;
    onChange?: (file: File | null) => void;
}

export function UploadField({
    label,
    accept = 'image/jpeg,image/png,image/webp',
    maxSizeMB = 15,
    error,
    onChange,
}: UploadFieldProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleFile = useCallback(
        (file: File | null) => {
            setLocalError(null);

            if (!file) {
                setPreview(null);
                setFileName(null);
                onChange?.(null);
                return;
            }

            // Validate file type
            const validTypes = accept.split(',').map((t) => t.trim());
            if (!validTypes.some((t) => file.type === t || file.type.match(t.replace('*', '.*')))) {
                setLocalError('Invalid file type. Please upload JPG, PNG, or WebP.');
                return;
            }

            // Validate file size
            if (file.size > maxSizeMB * 1024 * 1024) {
                setLocalError(`File too large. Maximum size is ${maxSizeMB}MB.`);
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            setFileName(file.name);
            onChange?.(file);
        },
        [accept, maxSizeMB, onChange]
    );

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        },
        [handleFile]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
            }
        },
        [handleFile]
    );

    const handleClear = useCallback(() => {
        setPreview(null);
        setFileName(null);
        setLocalError(null);
        onChange?.(null);
    }, [onChange]);

    const displayError = localError || error?.message;

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">{label}</label>

            <div
                className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${dragActive
                        ? 'border-violet-500 bg-violet-500/10'
                        : preview
                            ? 'border-emerald-500/50 bg-emerald-500/5'
                            : displayError
                                ? 'border-red-500/50 bg-red-500/5'
                                : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {preview ? (
                    <div className="relative p-4">
                        <img
                            src={preview}
                            alt="Preview"
                            className="mx-auto max-h-48 rounded-lg object-contain"
                        />
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2 top-2 rounded-full bg-gray-800 p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <p className="mt-2 text-center text-sm text-gray-400 truncate">{fileName}</p>
                    </div>
                ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center p-8">
                        <div className="rounded-full bg-gray-800 p-4 mb-4">
                            <svg
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-violet-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            JPG, PNG, WebP up to {maxSizeMB}MB
                        </p>
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleInputChange}
                            className="hidden"
                        />
                    </label>
                )}
            </div>

            {displayError && (
                <p className="text-sm text-red-400">{displayError}</p>
            )}
        </div>
    );
}
