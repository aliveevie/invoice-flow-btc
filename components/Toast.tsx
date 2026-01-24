import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/components/ui/cn';

export type ToastTone = 'success' | 'error' | 'info';

export type ToastState = {
  message: string;
  tone: ToastTone;
};

export type ToastProps = {
  toast: ToastState | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function Toast({ toast, onDismiss, durationMs = 2500 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [toast, onDismiss, durationMs]);

  if (!toast) return null;

  const { tone, message } = toast;
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Info;

  return (
    <div
      role="status"
      className={cn(
        'fixed top-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2',
        tone === 'success' && 'bg-orange-500 text-slate-900',
        tone === 'info' && 'bg-slate-200 text-slate-900',
        tone === 'error' && 'bg-red-500 text-white',
      )}
    >
      <Icon size={18} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

