import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Invoice } from '@/types';

export type InvoiceRowProps = {
  invoice: Invoice;
  onClick?: () => void;
  variant?: 'compact' | 'full';
};

export function InvoiceRow({ invoice, onClick, variant = 'full' }: InvoiceRowProps) {
  const statusIcon =
    invoice.status === 'paid' ? <CheckCircle2 size={variant === 'compact' ? 20 : 24} /> : <AlertCircle size={variant === 'compact' ? 20 : 24} />;

  return (
    <div
      className={
        variant === 'compact'
          ? 'bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-700 transition-all cursor-pointer'
          : 'bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl hover:bg-slate-800/60 transition-all cursor-pointer group'
      }
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center gap-4">
        <div
          className={`rounded-2xl ${
            invoice.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'
          } ${variant === 'compact' ? 'p-2 rounded-xl' : 'p-3'}`}
        >
          {statusIcon}
        </div>
        <div>
          <div className={variant === 'compact' ? 'font-medium text-slate-200' : 'font-bold text-lg text-slate-100 group-hover:text-orange-400 transition-colors'}>
            {invoice.description || (variant === 'compact' ? 'No description' : 'Untitled Request')}
          </div>
          <div className={variant === 'compact' ? 'text-xs text-slate-500' : 'text-sm text-slate-500'}>
            {variant === 'compact' ? new Date(invoice.createdAt).toLocaleDateString() : `Requested on ${new Date(invoice.createdAt).toLocaleDateString()}`}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={variant === 'compact' ? 'font-bold text-slate-100' : 'text-xl font-mono font-bold text-slate-200'}>
          {invoice.amountBtc} BTC
        </div>
        <div className={variant === 'compact' ? 'text-xs text-slate-400' : 'text-sm text-slate-400'}>
          ${parseFloat(invoice.amountUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
        </div>
        {variant === 'full' && (
          <div
            className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
              invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
            }`}
          >
            {invoice.status}
          </div>
        )}
      </div>
    </div>
  );
}

