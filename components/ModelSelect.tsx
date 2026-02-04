'use client';

/**
 * ModelSelect Component
 * 
 * Dropdown for selecting AI model (Pro vs Base)
 */

import { forwardRef } from 'react';

interface ModelSelectProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const models = [
    { value: 'nano-banana-pro', label: 'Pro Model (High Quality)' },
    { value: 'nano-banana', label: 'Base Model (Faster)' },
];

export const ModelSelect = forwardRef<HTMLSelectElement, ModelSelectProps>(
    function ModelSelect({ value, onChange, error }, ref) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">AI Model</label>
                <select
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full rounded-xl border bg-gray-900/50 px-4 py-3 text-white backdrop-blur transition-all focus:outline-none focus:ring-2 ${error
                        ? 'border-red-500/50 focus:ring-red-500'
                        : 'border-gray-700 hover:border-gray-600 focus:border-violet-500 focus:ring-violet-500/20'
                        }`}
                >
                    {models.map((model) => (
                        <option key={model.value} value={model.value} className="bg-gray-900">
                            {model.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
        );
    }
);
