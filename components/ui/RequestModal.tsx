'use client';

import { X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestData: any;
}

export default function RequestModal({
    isOpen,
    onClose,
    requestData,
}: RequestModalProps) {
    // Lock body scroll when modal is open
    useBodyScrollLock(isOpen);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200"
                data-scroll-lock-ignore
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Request Bilgileri
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                        {JSON.stringify(requestData, null, 2)}
                    </pre>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t border-light-border dark:border-dark-border">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}
