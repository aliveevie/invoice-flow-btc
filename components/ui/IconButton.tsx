import React from 'react';
import { cn } from '@/components/ui/cn';

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'md';
};

export function IconButton({ size = 'md', className, ...props }: IconButtonProps) {
  const padding = size === 'sm' ? 'p-2' : 'p-3';
  return (
    <button
      {...props}
      className={cn(
        padding,
        'rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    />
  );
}

