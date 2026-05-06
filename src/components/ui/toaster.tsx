'use client';

import { useToasts, useToast } from '@/hooks/use-toast';
import { ToastItem } from './toast';

export function Toaster() {
  const toasts = useToasts();
  const { dismiss } = useToast();

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}
