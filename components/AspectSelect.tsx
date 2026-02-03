'use client';

/**
 * AspectSelect Component
 * 
 * Dropdown for selecting output aspect ratio
 */

import { forwardRef } from 'react';

interface AspectSelectProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '3:4', label: 'Portrait (3:4)' },
    { value: '4:5', label: 'Portrait (4:5)' },
    { value: '9:16', label: 'Tall (9:16)' },
];

export const AspectSelect = forwardRef<HTMLSelectElement, AspectSelectProps>(
    function AspectSelect({ value, onChange, error }, ref) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Aspect Ratio</label>
                <select
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full rounded-xl border bg-gray-900/50 px-4 py-3 text-white backdrop-blur transition-all focus:outline-none focus:ring-2 ${error
                            ? 'border-red-500/50 focus:ring-red-500'
                            : 'border-gray-700 hover:border-gray-600 focus:border-violet-500 focus:ring-violet-500/20'
                        }`}
                >
                    {aspectRatios.map((ratio) => (
                        <option key={ratio.value} value={ratio.value} className="bg-gray-900">
                            {ratio.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
        );
    }
);
