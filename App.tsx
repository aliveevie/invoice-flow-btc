import React, { useCallback, useEffect, useState } from 'react';
import type { BTCPrice, Invoice } from '@/types';
import { AppHeader, type AppView } from '@/components/AppHeader';
import { AiAssistant } from '@/components/AiAssistant';
import { Toast, type ToastState, type ToastTone } from '@/components/Toast';
import { DashboardView } from '@/components/views/DashboardView';
import { CreateInvoiceView } from '@/components/views/CreateInvoiceView';
import { PayInvoiceView } from '@/components/views/PayInvoiceView';
import { HistoryView } from '@/components/views/HistoryView';
import { checkPaymentStatus, decodeShareLink, fetchBtcPrice, generatePayHash, generateShareLink } from '@/services/btcService';
import { createInvoice, type InvoiceDraft } from '@/services/invoiceService';
import { extractShareDataFromHash } from '@/services/shareLink';
import { clearInvoices, loadInvoices, saveInvoices } from '@/services/storage';
import { parseBtcAmount } from '@/services/validation';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [price, setPrice] = useState<BTCPrice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone) => {
    setToast({ message, tone });
  }, []);

  const updatePrice = useCallback(async () => {
    setIsRefreshingPrice(true);
    try {
      const btcPrice = await fetchBtcPrice();
      setPrice(btcPrice);
    } catch (err) {
      console.error('Failed to update BTC price', err);
      showToast('Failed to update BTC price.', 'error');
    } finally {
      setIsRefreshingPrice(false);
    }
  }, [showToast]);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
        }
        showToast('Copied!', 'success');
      } catch (err) {
        console.error('Copy failed', err);
        showToast('Copy failed.', 'error');
      }
    },
    [showToast],
  );

  const openInvoice = useCallback((invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setView('pay');
    window.location.hash = generatePayHash(invoice);
  }, []);

  const handleNavigate = useCallback((next: AppView) => {
    setView(next);
    if (next !== 'pay') {
      setCurrentInvoice(null);
      window.location.hash = '';
    }
  }, []);

  const handleCreate = useCallback(
    (draft: InvoiceDraft) => {
      if (!price) {
        showToast('BTC price is still loading.', 'info');
        return;
      }

      const invoice = createInvoice(draft, price);
      setInvoices((prev) => {
        const updated = [invoice, ...prev];
        saveInvoices(updated);
        return updated;
      });
      showToast('Invoice created.', 'success');
      openInvoice(invoice);
    },
    [openInvoice, price, showToast],
  );

  const handleClearHistory = useCallback(() => {
    setInvoices([]);
    clearInvoices();
    showToast('History cleared.', 'info');
    handleNavigate('home');
  }, [handleNavigate, showToast]);

  const handleCheckStatus = useCallback(async () => {
    if (!currentInvoice) return;

    const amount = parseBtcAmount(currentInvoice.amountBtc);
    if (amount === null) {
      showToast('This invoice has an invalid BTC amount.', 'error');
      return;
    }

    const isPaid = await checkPaymentStatus(currentInvoice.recipientAddress, amount);
    if (!isPaid) {
      showToast('No payment detected yet.', 'info');
      return;
    }

    const updated: Invoice = { ...currentInvoice, status: 'paid' };
    setCurrentInvoice(updated);
    setInvoices((prev) => {
      const exists = prev.some((inv) => inv.id === updated.id);
      if (!exists) return prev;
      const next = prev.map((inv) => (inv.id === updated.id ? updated : inv));
      saveInvoices(next);
      return next;
    });
    showToast('Payment detected!', 'success');
  }, [currentInvoice, showToast]);

  useEffect(() => {
    setInvoices(loadInvoices());
    void updatePrice();
  }, [updatePrice]);

  useEffect(() => {
    const interval = window.setInterval(() => void updatePrice(), 60_000);
    return () => window.clearInterval(interval);
  }, [updatePrice]);

  useEffect(() => {
    const applyHash = () => {
      const encoded = extractShareDataFromHash(window.location.hash);
      if (!encoded) return;
      const invoice = decodeShareLink(encoded);
      if (!invoice) return;
      setCurrentInvoice(invoice);
      setView('pay');
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <AppHeader
        view={view}
        price={price}
        isRefreshingPrice={isRefreshingPrice}
        onNavigate={handleNavigate}
        onRefreshPrice={updatePrice}
      />

      <main className="w-full max-w-4xl">
        {view === 'home' && (
          <DashboardView
            invoices={invoices}
            onCreate={() => handleNavigate('create')}
            onHistory={() => handleNavigate('history')}
            onSelectInvoice={openInvoice}
          />
        )}

        {view === 'create' && (
          <CreateInvoiceView
            price={price}
            onCancel={() => handleNavigate('home')}
            onCreate={handleCreate}
            onToast={showToast}
          />
        )}

        {view === 'pay' && currentInvoice && (
          <PayInvoiceView
            invoice={currentInvoice}
            onBackHome={() => handleNavigate('home')}
            onCopy={copyToClipboard}
            onCheckStatus={handleCheckStatus}
            getShareLink={() => generateShareLink(currentInvoice)}
          />
        )}

        {view === 'history' && (
          <HistoryView
            invoices={invoices}
            onSelectInvoice={openInvoice}
            onCreate={() => handleNavigate('create')}
            onClear={handleClearHistory}
          />
        )}
      </main>

      <AiAssistant onToast={showToast} />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <footer className="mt-12 w-full max-w-4xl text-center pb-8">
        <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} Invoice Flow. Built on Bitcoin (BTC).</p>
        <div className="flex justify-center gap-4 mt-4 text-slate-400">
          <a href="#" className="hover:text-orange-500 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
