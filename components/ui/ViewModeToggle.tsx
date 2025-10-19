'use client';

import { Info, Square, List, Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type ViewMode = 'square' | 'list' | 'grid';

interface ViewModeToggleProps {
    currentMode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({
    currentMode,
    onChange,
}: ViewModeToggleProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const modes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
        { mode: 'square', icon: <Square className="w-4 h-4" />, label: 'Square' },
        { mode: 'list', icon: <List className="w-4 h-4" />, label: 'List' },
        { mode: 'grid', icon: <Grid3x3 className="w-4 h-4" />, label: 'Grid' },
    ];

    return (
        <div className="flex items-center gap-1">
            {/* Info Button with Tooltip */}
            <div className="relative">
                <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="p-2 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    aria-label="Bilgilendirme"
                >
                    <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Tooltip */}
                {showTooltip && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg p-4 z-50">
                        <div className="space-y-3 text-xs">
                            {/* Tükendi - Sarı */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 border-2 border-yellow-500 rounded-md shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300">Tükendi</span>
                            </div>

                            {/* Pasif - Kırmızı */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 border-2 border-red-500 rounded-md shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300">Pasif</span>
                            </div>

                            {/* Yer Değiştirdi - Mor */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 border-2 border-purple-500 rounded-md shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300">Yer Değiştirdi</span>
                            </div>

                            {/* Aktif - Siyah */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 border-2 border-black dark:border-white rounded-md shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300">Aktif</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1">
                {modes.map(({ mode, icon, label }) => (
                    <button
                        key={mode}
                        onClick={() => onChange(mode)}
                        className={cn(
                            'p-2 rounded-md transition-colors',
                            currentMode === mode
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        )}
                        title={label}
                        aria-label={label}
                    >
                        {icon}
                    </button>
                ))}
            </div>
        </div>
    );
}