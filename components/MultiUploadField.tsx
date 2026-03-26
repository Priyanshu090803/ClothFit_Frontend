'use client';

/**
 * MultiUploadField Component
 *
 * Upload multiple body model photos (1-8) with grid preview, add/remove support.
 */

import { useCallback, useState } from 'react';

interface FileWithPreview {
    file: File;
    preview: string;
}

interface MultiUploadFieldProps {
    label: string;
    accept?: string;
    maxSizeMB?: number;
    maxFiles?: number;
    onChange?: (files: File[]) => void;
}

export function MultiUploadField({
    label,
    accept = 'image/jpeg,image/png,image/webp',
    maxSizeMB = 15,
    maxFiles = 8,
    onChange,
}: MultiUploadFieldProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback(
        (file: File): string | null => {
            const validTypes = accept.split(',').map((t) => t.trim());
            if (!validTypes.some((t) => file.type === t || file.type.match(t.replace('*', '.*')))) {
                return 'Invalid file type. Please upload JPG, PNG, or WebP.';
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                return `File too large. Maximum size is ${maxSizeMB}MB.`;
            }
            return null;
        },
        [accept, maxSizeMB]
    );

    const addFiles = useCallback(
        (newFiles: FileList | File[]) => {
            setError(null);
            const fileArray = Array.from(newFiles);

            if (files.length + fileArray.length > maxFiles) {
                setError(`Maximum ${maxFiles} photos allowed. You have ${files.length}, trying to add ${fileArray.length}.`);
                return;
            }

            const validFiles: FileWithPreview[] = [];
            for (const file of fileArray) {
                const err = validateFile(file);
                if (err) {
                    setError(err);
                    return;
                }
                const preview = URL.createObjectURL(file);
                validFiles.push({ file, preview });
            }

            const updated = [...files, ...validFiles];
            setFiles(updated);
            onChange?.(updated.map((f) => f.file));
        },
        [files, maxFiles, validateFile, onChange]
    );

    const removeFile = useCallback(
        (index: number) => {
            setError(null);
            const updated = files.filter((_, i) => i !== index);
            // Revoke old preview URL
            URL.revokeObjectURL(files[index].preview);
            setFiles(updated);
            onChange?.(updated.map((f) => f.file));
        },
        [files, onChange]
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
            if (e.dataTransfer.files?.length) {
                addFiles(e.dataTransfer.files);
            }
        },
        [addFiles]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.length) {
                addFiles(e.target.files);
                // Reset input so re-selecting same files works
                e.target.value = '';
            }
        },
        [addFiles]
    );

    const clearAll = useCallback(() => {
        files.forEach((f) => URL.revokeObjectURL(f.preview));
        setFiles([]);
        setError(null);
        onChange?.([]);
    }, [files, onChange]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-200">{label}</label>
                <span className="text-xs text-gray-500">
                    {files.length}/{maxFiles} uploaded
                </span>
            </div>

            {/* Preview Grid */}
            {files.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {files.map((item, index) => (
                        <div
                            key={index}
                            className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50"
                        >
                            <img
                                src={item.preview}
                                alt={`Body ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 text-center text-[10px] text-gray-300">
                                Body {index + 1}
                            </div>
                        </div>
                    ))}

                    {/* Add more button (if under limit) */}
                    {files.length < maxFiles && (
                        <label
                            className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/30 transition-all hover:border-violet-500 hover:bg-violet-500/5"
                        >
                            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="mt-1 text-[10px] text-gray-500">Add more</span>
                            <input
                                type="file"
                                accept={accept}
                                multiple
                                onChange={handleInputChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            )}

            {/* Empty state — drop zone */}
            {files.length === 0 && (
                <div
                    className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${dragActive
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <label className="flex cursor-pointer flex-col items-center justify-center p-8">
                        <div className="rounded-full bg-gray-800 p-4 mb-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-violet-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Upload 1-{maxFiles} body model photos (JPG, PNG, WebP up to {maxSizeMB}MB each)
                        </p>
                        <input
                            type="file"
                            accept={accept}
                            multiple
                            onChange={handleInputChange}
                            className="hidden"
                        />
                    </label>
                </div>
            )}

            {/* Clear all button */}
            {files.length > 1 && (
                <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-gray-500 transition-colors hover:text-red-400"
                >
                    Clear all photos
                </button>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
    );
}
