'use client';

/**
 * ImageCountSelect Component
 * 
 * Dropdown for selecting number of output images
 */

import { forwardRef } from 'react';

interface ImageCountSelectProps {
    value: number;
    onChange: (value: number) => void;
    error?: string;
}

const imageCounts = [
    { value: 1, label: '1 Image' },
    { value: 2, label: '2 Images' },
    { value: 3, label: '3 Images' },
    { value: 4, label: '4 Images' },
];

export const ImageCountSelect = forwardRef<HTMLSelectElement, ImageCountSelectProps>(
    function ImageCountSelect({ value, onChange, error }, ref) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Number of Images</label>
                <select
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className={`w-full rounded-xl border bg-gray-900/50 px-4 py-3 text-white backdrop-blur transition-all focus:outline-none focus:ring-2 ${error
                            ? 'border-red-500/50 focus:ring-red-500'
                            : 'border-gray-700 hover:border-gray-600 focus:border-violet-500 focus:ring-violet-500/20'
                        }`}
                >
                    {imageCounts.map((count) => (
                        <option key={count.value} value={count.value} className="bg-gray-900">
                            {count.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
        );
    }
);
