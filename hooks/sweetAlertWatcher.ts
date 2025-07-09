import { useEffect } from 'react';

export function useSweetAlertWatcher(onOpen: () => void, onClose: () => void) {
        useEffect(() => {
            if (typeof window === 'undefined') return;

            const observer = new MutationObserver(() => {
            const swalVisible = !!document.querySelector('.swal2-container');
            if (swalVisible) {
                onOpen();
            } else {
                onClose();
            }
            });

            observer.observe(document.body, {
            childList: true,
            subtree: true,
            });

            return () => observer.disconnect();
        }, [onOpen, onClose]);
    }