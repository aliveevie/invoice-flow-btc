import type { Invoice } from '@/types';

const INVOICE_STATUSES = new Set<Invoice['status']>(['pending', 'paid', 'expired']);

export function isInvoice(value: unknown): value is Invoice {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.id === 'string' &&
    typeof v.recipientAddress === 'string' &&
    typeof v.amountBtc === 'string' &&
    typeof v.amountUsd === 'string' &&
    typeof v.description === 'string' &&
    typeof v.createdAt === 'number' &&
    INVOICE_STATUSES.has(v.status as Invoice['status'])
  );
}

export function coerceInvoice(value: unknown): Invoice | null {
  if (!isInvoice(value)) return null;
  return value;
}

