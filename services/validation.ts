export function isValidBtcAddress(address: string): boolean {
  const trimmed = address.trim();
  if (trimmed.length < 14 || trimmed.length > 90) return false;

  if (trimmed.startsWith('bc1')) {
    return /^[a-z0-9]+$/.test(trimmed);
  }

  // Base58 legacy (P2PKH/P2SH) heuristics.
  if (trimmed.startsWith('1') || trimmed.startsWith('3')) {
    if (trimmed.length < 26 || trimmed.length > 35) return false;
    return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(trimmed);
  }

  return false;
}

export function parseBtcAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,8})?$/.test(trimmed)) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  if (parsed > 21_000_000) return null;

  return parsed;
}

export function formatBtcAmount(value: number): string {
  const fixed = value.toFixed(8);
  return fixed.replace(/\.?0+$/g, '');
}

