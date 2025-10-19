'use client';

import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

type ModalType = 'warning' | 'success' | 'error';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    type: ModalType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    type,
    title,
    message,
    confirmText = 'Tamam',
    cancelText = 'Vazgeç'
}: ConfirmModalProps) {
    // Lock body scroll when modal is open
    useBodyScrollLock(isOpen);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'warning':
                return <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500" />;
            case 'success':
                return <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500" />;
            case 'error':
                return <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-amber-500" />;
        }
    };

    const getIconBackground = () => {
        switch (type) {
            case 'warning':
                return 'bg-red-100 dark:bg-red-900/20';
            case 'success':
                return 'bg-green-100 dark:bg-green-900/20';
            case 'error':
                return 'bg-amber-100 dark:bg-amber-900/20';
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md animate-scale-in"
                data-scroll-lock-ignore
            >
                {/* Icon */}
                <div className="flex justify-center pt-8 pb-4">
                    <div className={`p-4 rounded-full ${getIconBackground()}`}>
                        {getIcon()}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {title}
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 px-6 pb-6">
                    {type === 'warning' && onConfirm ? (
                        <>
                            {/* Cancel Button - Red */}
                            <button
                                onClick={() => {
                                    if (onCancel) {
                                        onCancel();
                                    }
                                    onClose();
                                }}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
                            >
                                {cancelText}
                            </button>
                            {/* Confirm Button - Green */}
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        /* Single Button for Success/Error */
                        <button
                            onClick={onClose}
                            className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors text-sm md:text-base ${type === 'success'
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
