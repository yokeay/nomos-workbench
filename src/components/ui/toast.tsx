'use client';

import { Toast as ToastType } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap: Record<ToastType['type'], React.ReactNode> = {
  success: <CheckCircle className="size-4" />,
  error: <XCircle className="size-4" />,
  warning: <AlertTriangle className="size-4" />,
  info: <Info className="size-4" />,
};

const colorMap: Record<ToastType['type'], string> = {
  success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  error: 'border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400',
  warning: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
  info: 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400',
};

export function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 px-4 py-3 rounded-xl border bg-popover/90 backdrop-blur-lg shadow-lg-soft animate-in slide-in-from-top-2 max-w-sm',
        colorMap[toast.type]
      )}
      role="alert"
    >
      <span className="flex-shrink-0 mt-px">
        {iconMap[toast.type]}
      </span>
      <span className="text-sm leading-relaxed flex-1">
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity cursor-pointer mt-0.5"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
