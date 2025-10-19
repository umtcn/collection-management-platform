import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal is open
 * Works across all browsers including Safari iOS
 * 
 * @param isLocked - Boolean to control if scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return;

        // Store original styles
        const originalStyle = window.getComputedStyle(document.body).overflow;
        const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;

        // Get scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Lock scroll
        document.body.style.overflow = 'hidden';

        // Add padding to prevent layout shift when scrollbar disappears
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // iOS Safari specific fixes
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            // Prevent touch move on body
            const preventTouchMove = (e: TouchEvent) => {
                // Allow scrolling inside modal content
                const target = e.target as HTMLElement;
                const modal = target.closest('[data-scroll-lock-ignore]');
                if (!modal) {
                    e.preventDefault();
                }
            };

            document.body.addEventListener('touchmove', preventTouchMove, { passive: false });

            // Cleanup iOS listeners
            return () => {
                document.body.removeEventListener('touchmove', preventTouchMove);
                document.body.style.overflow = originalStyle;
                document.body.style.paddingRight = originalPaddingRight;
            };
        }

        // Cleanup for non-iOS
        return () => {
            document.body.style.overflow = originalStyle;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [isLocked]);
}
