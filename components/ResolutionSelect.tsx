'use client';

/**
 * ResolutionSelect Component
 * 
 * Dropdown for selecting output resolution
 */

import { forwardRef } from 'react';

interface ResolutionSelectProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const resolutions = [
    { value: '1K', label: '1K (1024px)' },
    { value: '2K', label: '2K (2048px)' },
    { value: '4K', label: '4K (4096px)' },
];

export const ResolutionSelect = forwardRef<HTMLSelectElement, ResolutionSelectProps>(
    function ResolutionSelect({ value, onChange, error }, ref) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Resolution</label>
                <select
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full rounded-xl border bg-gray-900/50 px-4 py-3 text-white backdrop-blur transition-all focus:outline-none focus:ring-2 ${error
                            ? 'border-red-500/50 focus:ring-red-500'
                            : 'border-gray-700 hover:border-gray-600 focus:border-violet-500 focus:ring-violet-500/20'
                        }`}
                >
                    {resolutions.map((res) => (
                        <option key={res.value} value={res.value} className="bg-gray-900">
                            {res.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
        );
    }
);
