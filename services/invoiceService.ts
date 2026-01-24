import type { BTCPrice, Invoice } from '@/types';
import { formatBtcAmount, isValidBtcAddress, parseBtcAmount } from '@/services/validation';

export type InvoiceDraft = {
  recipientAddress: string;
  amountBtc: string;
  description: string;
};

function generateInvoiceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function validateInvoiceDraft(draft: InvoiceDraft): { ok: true; amountBtc: number } | { ok: false; error: string } {
  if (!isValidBtcAddress(draft.recipientAddress)) {
    return { ok: false, error: 'Enter a valid BTC address (legacy or bc1).' };
  }

  const amount = parseBtcAmount(draft.amountBtc);
  if (amount === null) {
    return { ok: false, error: 'Enter a valid BTC amount (up to 8 decimals).' };
  }

  return { ok: true, amountBtc: amount };
}

export function createInvoice(draft: InvoiceDraft, price: BTCPrice): Invoice {
  const validation = validateInvoiceDraft(draft);
  if (validation.ok === false) {
    throw new Error(validation.error);
  }

  const amountUsd = (validation.amountBtc * price.usd).toFixed(2);

  return {
    id: generateInvoiceId(),
    recipientAddress: draft.recipientAddress.trim(),
    amountBtc: formatBtcAmount(validation.amountBtc),
    amountUsd,
    description: draft.description.trim(),
    createdAt: Date.now(),
    status: 'pending',
  };
}

export function buildBitcoinUri(invoice: Pick<Invoice, 'recipientAddress' | 'amountBtc'>): string {
  const address = invoice.recipientAddress.trim();
  const amount = invoice.amountBtc.trim();
  return `bitcoin:${address}?amount=${encodeURIComponent(amount)}`;
}
