import React, { useState } from 'react';
import { History } from 'lucide-react';
import type { Invoice } from '@/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { InvoiceRow } from '@/components/InvoiceRow';

export type HistoryViewProps = {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onCreate: () => void;
  onClear: () => void;
};

export function HistoryView({ invoices, onSelectInvoice, onCreate, onClear }: HistoryViewProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoicing History</h2>
        <button onClick={() => setConfirmOpen(true)} className="text-xs text-red-400 hover:underline">
          Clear History
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Clear invoice history?"
        description="This removes your locally stored invoice history from this browser."
        confirmText="Clear"
        tone="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onClear();
        }}
      />

      {invoices.length === 0 ? (
        <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-12 text-center text-slate-500">
          <History className="mx-auto mb-4 opacity-20" size={64} />
          <p>You haven't created any invoices yet.</p>
          <button onClick={onCreate} className="mt-4 text-orange-500 hover:underline">
            Create your first one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} onClick={() => onSelectInvoice(invoice)} variant="full" />
          ))}
        </div>
      )}
    </div>
  );
}

