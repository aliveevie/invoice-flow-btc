export type BitcoinWalletId = 'unisat' | 'okx' | 'unknown';

export type BitcoinWalletProvider = {
  id: BitcoinWalletId;
  name: string;
  getAddresses: () => Promise<string[]>;
};

type AnyProvider = Record<string, unknown>;

function hasFunction(obj: unknown, key: string): obj is Record<string, (...args: any[]) => any> {
  return Boolean(obj && typeof obj === 'object' && typeof (obj as any)[key] === 'function');
}

function getGlobal(): any {
  return typeof window !== 'undefined' ? (window as any) : undefined;
}

async function getAddressesFromUnknownProvider(provider: AnyProvider): Promise<string[]> {
  if (hasFunction(provider, 'requestAccounts')) {
    const res = await (provider as any).requestAccounts();
    if (Array.isArray(res)) return res.filter((v) => typeof v === 'string');
  }

  if (hasFunction(provider, 'getAccounts')) {
    const res = await (provider as any).getAccounts();
    if (Array.isArray(res)) return res.filter((v) => typeof v === 'string');
  }

  if (hasFunction(provider, 'request')) {
    const res = await (provider as any).request({ method: 'getAccounts' });
    if (Array.isArray(res)) return res.filter((v) => typeof v === 'string');
  }

  return [];
}

export function detectBitcoinWallets(): BitcoinWalletProvider[] {
  const g = getGlobal();
  const wallets: BitcoinWalletProvider[] = [];

  const unisat = g?.unisat;
  if (unisat && typeof unisat === 'object') {
    wallets.push({
      id: 'unisat',
      name: 'UniSat',
      getAddresses: async () => getAddressesFromUnknownProvider(unisat as AnyProvider),
    });
  }

  const okxBitcoin = g?.okxwallet?.bitcoin;
  if (okxBitcoin && typeof okxBitcoin === 'object') {
    wallets.push({
      id: 'okx',
      name: 'OKX Wallet',
      getAddresses: async () => getAddressesFromUnknownProvider(okxBitcoin as AnyProvider),
    });
  }

  // Fallback: some wallets expose `window.bitcoin` or similar. We only use it if it has a common API.
  const generic = g?.bitcoin;
  if (generic && typeof generic === 'object') {
    wallets.push({
      id: 'unknown',
      name: 'Browser Bitcoin Wallet',
      getAddresses: async () => getAddressesFromUnknownProvider(generic as AnyProvider),
    });
  }

  return wallets;
}

export async function connectBitcoinWallet(): Promise<{ wallet: BitcoinWalletProvider; address: string }> {
  const wallets = detectBitcoinWallets();
  if (wallets.length === 0) {
    throw new Error('No compatible Bitcoin wallet detected. Install a browser wallet extension and try again.');
  }

  for (const wallet of wallets) {
    const addresses = await wallet.getAddresses();
    const address = addresses.find((a) => typeof a === 'string' && a.trim().length > 0);
    if (address) return { wallet, address };
  }

  throw new Error('Wallet detected, but no address was returned. Make sure the wallet is unlocked and has permissions.');
}

