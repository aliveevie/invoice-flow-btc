import React, { useState } from 'react';
import { Copy, ExternalLink, Share2 } from 'lucide-react';
import type { Invoice } from '@/types';
import QRCode from '@/components/QRCode';
import { buildBitcoinUri } from '@/services/invoiceService';

export type PayInvoiceViewProps = {
  invoice: Invoice;
  onBackHome: () => void;
  onCopy: (text: string) => Promise<void>;
  onCheckStatus: () => Promise<void>;
  getShareLink: () => string;
};

export function PayInvoiceView({ invoice, onBackHome, onCopy, onCheckStatus, getShareLink }: PayInvoiceViewProps) {
  const [isChecking, setIsChecking] = useState(false);
  const bitcoinUri = buildBitcoinUri(invoice);

  if (invoice.status === 'paid') {
    return (
      <div className="max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
          <div className="text-center py-8 space-y-4">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 border-2 border-green-500/30">
              <span className="text-5xl leading-none">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Payment Received!</h2>
            <p className="text-slate-400">This invoice has been marked as paid.</p>
            <button
              onClick={onBackHome}
              className="bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold px-8 py-3 rounded-2xl transition-all mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(getShareLink())}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-all flex items-center gap-2 text-sm"
              title="Copy share link"
            >
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        <div className="mb-8 p-4 bg-white rounded-3xl shadow-xl">
          <QRCode data={bitcoinUri} className="p-4 rounded-2xl inline-block" />
        </div>

        <div className="w-full space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Amount to Pay</p>
              <p className="text-2xl font-mono font-bold text-orange-400">{invoice.amountBtc} BTC</p>
              <p className="text-sm text-slate-400">
                ≈ ${parseFloat(invoice.amountUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </p>
            </div>
            <button
              onClick={() => onCopy(invoice.amountBtc)}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all active:scale-90"
              title="Copy amount"
            >
              <Copy size={20} />
            </button>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Send to Address</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-300 flex-1">
                {invoice.recipientAddress}
              </code>
              <button
                onClick={() => onCopy(invoice.recipientAddress)}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all active:scale-90"
                title="Copy address"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-2xl text-center">
            <p className="text-sm text-slate-400 italic">"{invoice.description || 'No description provided'}"</p>
          </div>

          <div className="pt-4 space-y-3">
            <a
              href={bitcoinUri}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Open in Wallet
            </a>
            <button
              onClick={async () => {
                setIsChecking(true);
                try {
                  await onCheckStatus();
                } finally {
                  setIsChecking(false);
                }
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isChecking}
            >
              {isChecking ? 'Checking…' : 'Check Payment Status'}
            </button>
            <button
              onClick={() => window.open(`https://blockchair.com/bitcoin/address/${invoice.recipientAddress}`, '_blank')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              View on Explorer <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
