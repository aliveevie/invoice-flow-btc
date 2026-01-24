import React from 'react';
import { ArrowRight, History, Send } from 'lucide-react';
import type { Invoice } from '@/types';
import { InvoiceRow } from '@/components/InvoiceRow';

export type DashboardViewProps = {
  invoices: Invoice[];
  onCreate: () => void;
  onHistory: () => void;
  onSelectInvoice: (invoice: Invoice) => void;
};

export function DashboardView({ invoices, onCreate, onHistory, onSelectInvoice }: DashboardViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-orange-500/10 transition-transform group-hover:scale-110">
            <Send size={120} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Request Payment</h2>
          <p className="text-slate-400 mb-8 max-w-xs">
            Generate a simple payment link for any amount in Bitcoin (BTC). Share it anywhere.
          </p>
          <button
            onClick={onCreate}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-colors font-medium"
          >
            Start Now <ArrowRight size={18} />
          </button>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-slate-500/10 transition-transform group-hover:scale-110">
            <History size={120} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Past Invoices</h2>
          <p className="text-slate-400 mb-8 max-w-xs">View your transaction history and track the status of your payment requests.</p>
          <button
            onClick={onHistory}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-colors font-medium"
          >
            View History <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <button onClick={onHistory} className="text-sm text-orange-500 hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {invoices.slice(0, 3).map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                variant="compact"
                onClick={() => onSelectInvoice(invoice)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

