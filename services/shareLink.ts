import type { Invoice } from '@/types';
import { coerceInvoice } from '@/services/invoiceGuards';

function bytesToBinaryString(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i++) result += String.fromCharCode(bytes[i]);
  return result;
}

function binaryStringToBytes(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncodeString(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const base64 = btoa(bytesToBinaryString(bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToString(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = binaryStringToBytes(binary);
  return new TextDecoder().decode(bytes);
}

export function encodeInvoiceToShareData(invoice: Invoice): string {
  return base64UrlEncodeString(JSON.stringify(invoice));
}

export function decodeShareDataToInvoice(encoded: string): Invoice | null {
  try {
    const decoded = base64UrlDecodeToString(encoded);
    return coerceInvoice(JSON.parse(decoded));
  } catch {
    return null;
  }
}

export function buildPayHash(encoded: string): string {
  return `/pay?data=${encoded}`;
}

export function buildShareLink(encoded: string): string {
  return `${window.location.origin}/#${buildPayHash(encoded)}`;
}

export function extractShareDataFromHash(hash: string): string | null {
  if (!hash.startsWith('#')) return null;
  const normalized = hash.slice(1);

  const queryIndex = normalized.indexOf('?');
  if (queryIndex === -1) return null;

  const path = normalized.slice(0, queryIndex);
  if (path !== '/pay') return null;

  const params = new URLSearchParams(normalized.slice(queryIndex + 1));
  return params.get('data');
}

