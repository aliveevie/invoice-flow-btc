import React from 'react';
import { Bitcoin, Plus, RefreshCw } from 'lucide-react';
import type { BTCPrice } from '@/types';

export type AppView = 'home' | 'create' | 'pay' | 'history';

export type AppHeaderProps = {
  view: AppView;
  price: BTCPrice | null;
  isRefreshingPrice: boolean;
  onNavigate: (view: AppView) => void;
  onRefreshPrice: () => void;
};

export function AppHeader({ view, price, isRefreshingPrice, onNavigate, onRefreshPrice }: AppHeaderProps) {
  return (
    <header className="w-full max-w-4xl flex justify-between items-center mb-8">
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => {
          onNavigate('home');
          window.location.hash = '';
        }}
        role="button"
        tabIndex={0}
      >
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
          <Bitcoin className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          Invoice Flow
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onNavigate('home')}
          className={`hover:text-white transition-colors ${view === 'home' ? 'text-white' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('history')}
          className={`hover:text-white transition-colors ${view === 'history' ? 'text-white' : ''}`}
        >
          History
        </button>
        <button
          onClick={onRefreshPrice}
          className="bg-slate-800/50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700/50 hover:border-slate-600 transition-colors"
          title="Refresh BTC price"
        >
          <RefreshCw className={`w-3 h-3 text-orange-500 ${isRefreshingPrice ? 'animate-spin' : ''}`} />
          <span className="text-slate-300 font-mono">
            BTC:{' '}
            {price
              ? `$${price.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'Loading...'}
          </span>
        </button>
      </div>

      <button
        onClick={() => onNavigate('create')}
        className="bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-xl shadow-orange-500/10 active:scale-95"
      >
        <Plus size={20} />
        Create
      </button>
    </header>
  );
}

