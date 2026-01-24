import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { connectBitcoinWallet } from '@/services/wallets/bitcoinWallets';

export type WalletConnectCardProps = {
  onConnected: (address: string) => void;
  onToast: (message: string, tone: 'success' | 'error' | 'info') => void;
};

export function WalletConnectCard({ onConnected, onToast }: WalletConnectCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 p-4 rounded-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="text-orange-500" size={18} />
            <h3 className="font-bold text-sm text-slate-200">Connect Wallet</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Autofill your receiving BTC address from a browser wallet extension (if available).
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            setIsConnecting(true);
            try {
              const { wallet, address } = await connectBitcoinWallet();
              onConnected(address);
              onToast(`Connected: ${wallet.name}`, 'success');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Wallet connection failed.';
              onToast(message, 'error');
            } finally {
              setIsConnecting(false);
            }
          }}
          disabled={isConnecting}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting…' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

