import type { Invoice } from '@/types';
import { coerceInvoice } from '@/services/invoiceGuards';

const STORAGE_KEYS = {
  invoices: 'invoice_flow_history_btc',
  geminiApiKey: 'invoice_flow_gemini_api_key',
} as const;

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function loadInvoices(): Invoice[] {
  const raw = localStorage.getItem(STORAGE_KEYS.invoices);
  if (!raw) return [];

  const parsed = safeJsonParse(raw);
  if (!Array.isArray(parsed)) return [];

  const invoices = parsed.map(coerceInvoice).filter(Boolean) as Invoice[];
  invoices.sort((a, b) => b.createdAt - a.createdAt);
  return invoices;
}

export function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
}

export function clearInvoices(): void {
  localStorage.removeItem(STORAGE_KEYS.invoices);
}

export function loadGeminiApiKey(): string | null {
  const raw = localStorage.getItem(STORAGE_KEYS.geminiApiKey);
  if (!raw) return null;
  const key = raw.trim();
  return key.length > 0 ? key : null;
}

export function saveGeminiApiKey(apiKey: string): void {
  localStorage.setItem(STORAGE_KEYS.geminiApiKey, apiKey.trim());
}

export function clearGeminiApiKey(): void {
  localStorage.removeItem(STORAGE_KEYS.geminiApiKey);
}

