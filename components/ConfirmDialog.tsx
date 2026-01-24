import React from 'react';
import { Button } from '@/components/ui/Button';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

