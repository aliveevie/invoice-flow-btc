import React from 'react';
import { cn } from '@/components/ui/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold shadow-xl shadow-orange-500/10 active:scale-95',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white font-bold active:scale-95',
  ghost: 'text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95',
  danger: 'bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 active:scale-95',
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'secondary', className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className,
      )}
    />
  );
}

