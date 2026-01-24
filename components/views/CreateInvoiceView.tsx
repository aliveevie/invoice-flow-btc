import React, { useMemo, useState } from 'react';
import { BrainCircuit, Plus } from 'lucide-react';
import type { BTCPrice } from '@/types';
import type { InvoiceDraft } from '@/services/invoiceService';
import { validateInvoiceDraft } from '@/services/invoiceService';
import { parseBtcAmount } from '@/services/validation';
import { MissingGeminiApiKeyError, suggestDescription } from '@/services/geminiService';
import { WalletConnectCard } from '@/components/WalletConnectCard';

export type CreateInvoiceViewProps = {
  price: BTCPrice | null;
  onCancel: () => void;
  onCreate: (draft: InvoiceDraft) => void;
  onToast: (message: string, tone: 'success' | 'error' | 'info') => void;
};

export function CreateInvoiceView({ price, onCancel, onCreate, onToast }: CreateInvoiceViewProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amountBtc, setAmountBtc] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const usdEstimate = useMemo(() => {
    if (!price) return null;
    const amount = parseBtcAmount(amountBtc);
    if (amount === null) return null;
    return amount * price.usd;
  }, [amountBtc, price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!price) {
      setError('BTC price is still loading. Try again in a moment.');
      return;
    }

    const draft: InvoiceDraft = { recipientAddress, amountBtc, description };
    const validation = validateInvoiceDraft(draft);
    if (validation.ok === false) {
      setError(validation.error);
      return;
    }

    onCreate(draft);
  };

  const handleAutoFillDescription = async () => {
    if (!description.trim()) return;
    setIsAiLoading(true);
    try {
      const suggested = await suggestDescription(description.trim());
      if (suggested) setDescription(suggested.trim());
      onToast('Description updated.', 'success');
    } catch (err) {
      if (err instanceof MissingGeminiApiKeyError) {
        onToast('Add a Gemini API key in the assistant to use AI features.', 'info');
      } else {
        onToast('AI request failed. Please try again.', 'error');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
      <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Plus className="text-orange-500" /> Create New Invoice
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <WalletConnectCard
            onConnected={(addr) => {
              setRecipientAddress(addr);
              setError(null);
            }}
            onToast={onToast}
          />
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Recipient BTC Address</label>
            <input
              required
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="1... or bc1..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600 transition-all font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Amount (BTC)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold">₿</span>
              <input
                required
                type="number"
                step="0.00000001"
                value={amountBtc}
                onChange={(e) => setAmountBtc(e.target.value)}
                placeholder="0.00000000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600 transition-all font-mono"
              />
              {usdEstimate !== null && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ≈ ${usdEstimate.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-400">Description</label>
              <button
                type="button"
                onClick={handleAutoFillDescription}
                disabled={!description.trim() || isAiLoading}
                className="text-xs text-orange-500 flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <BrainCircuit size={14} /> {isAiLoading ? 'Working…' : 'AI Professional Touch'}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Website design services…"
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600 transition-all resize-none"
            />
          </div>

          {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</div>}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
