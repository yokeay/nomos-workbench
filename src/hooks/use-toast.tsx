'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastId = string;

export interface Toast {
  id: ToastId;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastActions {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: ToastId) => void;
}

interface ToastContextValue {
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextValue | null>(null);
const ToastActionsContext = createContext<ToastActions | null>(null);

const TOAST_DURATION = 4000;

function generateId(): ToastId {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = TOAST_DURATION) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const dismiss = useCallback((id: ToastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const actions: ToastActions = {
    success: (message, duration) => addToast('success', message, duration),
    error: (message, duration) => addToast('error', message, duration),
    warning: (message, duration) => addToast('warning', message, duration),
    info: (message, duration) => addToast('info', message, duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toasts }}>
      <ToastActionsContext.Provider value={actions}>
        {children}
      </ToastActionsContext.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastActions {
  const ctx = useContext(ToastActionsContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function useToasts(): Toast[] {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within ToastProvider');
  return ctx.toasts;
}
