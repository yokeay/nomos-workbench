'use client';

import { Toast as ToastType } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const icons: Record<ToastType['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const colorMap: Record<ToastType['type'], string> = {
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
};

export function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-top-2 max-w-sm',
        colorMap[toast.type]
      )}
      role="alert"
    >
      <span className="text-sm font-bold leading-relaxed flex-shrink-0 mt-px">
        {icons[toast.type]}
      </span>
      <span className="text-sm leading-relaxed flex-1">
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-60 hover:opacity-100 flex-shrink-0 cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}
