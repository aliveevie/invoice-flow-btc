
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Send, 
  History, 
  Wallet, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Share2,
  BrainCircuit,
  Loader2,
  X,
  Bitcoin,
  RefreshCw
} from 'lucide-react';
import { fetchBtcPrice, generateShareLink, decodeShareLink, checkPaymentStatus } from './services/btcService';
import { getInvoiceAssistance, suggestDescription } from './services/geminiService';
import { Invoice, BTCPrice, ChatMessage } from './types';
import QRCode from './components/QRCode';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'create' | 'pay' | 'history'>('home');
  const [price, setPrice] = useState<BTCPrice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);

  // Form State
  const [address, setAddress] = useState('');
  const [amountBtc, setAmountBtc] = useState('');
  const [description, setDescription] = useState('');

  const updatePrice = async () => {
    setIsRefreshingPrice(true);
    try {
      const btcPrice = await fetchBtcPrice();
      setPrice(btcPrice);
    } catch (err) {
      console.error("Failed to update price", err);
    } finally {
      setIsRefreshingPrice(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await updatePrice();
      
      const savedInvoices = localStorage.getItem('invoice_flow_history_btc');
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

      // Handle Share Links
      const hash = window.location.hash;
      if (hash.startsWith('#/pay?data=')) {
        const encoded = hash.split('data=')[1];
        const data = decodeShareLink(encoded);
        if (data) {
          setCurrentInvoice(data);
          setView('pay');
        }
      }
    };
    init();

    // Refresh price every 60 seconds
    const interval = setInterval(updatePrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) {
      await updatePrice();
      if (!price) return;
    }

    const usdAmount = (parseFloat(amountBtc) * price.usd).toFixed(2);
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substring(7),
      recipientAddress: address,
      amountBtc: amountBtc,
      amountUsd: usdAmount,
      description: description,
      createdAt: Date.now(),
      status: 'pending',
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('invoice_flow_history_btc', JSON.stringify(updatedInvoices));
    setCurrentInvoice(newInvoice);
    setView('pay');
    
    window.location.hash = `/pay?data=${btoa(JSON.stringify(newInvoice))}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAiAssistance = async () => {
    if (!userInput.trim()) return;
    setIsAiLoading(true);
    const userMsg: ChatMessage = { role: 'user', text: userInput };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');

    try {
      const response = await getInvoiceAssistance(userInput);
      if (response) {
        setChatHistory(prev => [...prev, { role: 'model', text: response }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAutoFillDescription = async () => {
    if (!description) return;
    setIsAiLoading(true);
    try {
      const suggested = await suggestDescription(description);
      if (suggested) setDescription(suggested.trim());
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!currentInvoice) return;
    const isPaid = await checkPaymentStatus(currentInvoice.recipientAddress, parseFloat(currentInvoice.amountBtc));
    if (isPaid) {
      const updated = { ...currentInvoice, status: 'paid' as const };
      setCurrentInvoice(updated);
      const newHistory = invoices.map(inv => inv.id === currentInvoice.id ? updated : inv);
      setInvoices(newHistory);
      localStorage.setItem('invoice_flow_history_btc', JSON.stringify(newHistory));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            setView('home');
            window.location.hash = '';
          }}
        >
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <Bitcoin className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Invoice Flow
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button onClick={() => setView('home')} className={`hover:text-white transition-colors ${view === 'home' ? 'text-white' : ''}`}>Dashboard</button>
          <button onClick={() => setView('history')} className={`hover:text-white transition-colors ${view === 'history' ? 'text-white' : ''}`}>History</button>
          <div className="bg-slate-800/50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700/50">
            <RefreshCw className={`w-3 h-3 text-orange-500 ${isRefreshingPrice ? 'animate-spin' : ''}`} />
            <span className="text-slate-300 font-mono">BTC: ${price ? price.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Loading...'}</span>
          </div>
        </div>

        <button 
          onClick={() => setView('create')}
          className="bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-xl shadow-orange-500/10 active:scale-95"
        >
          <Plus size={20} />
          Create
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl">
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-orange-500/10 transition-transform group-hover:scale-110">
                  <Send size={120} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Request Payment</h2>
                <p className="text-slate-400 mb-8 max-w-xs">
                  Generate a simple payment link for any amount in Bitcoin (BTC). Share it anywhere.
                </p>
                <button 
                  onClick={() => setView('create')}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-colors font-medium"
                >
                  Start Now <ArrowRight size={18} />
                </button>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-slate-500/10 transition-transform group-hover:scale-110">
                  <History size={120} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Past Invoices</h2>
                <p className="text-slate-400 mb-8 max-w-xs">
                  View your transaction history and track the status of your payment requests.
                </p>
                <button 
                  onClick={() => setView('history')}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-colors font-medium"
                >
                  View History <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {invoices.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <button onClick={() => setView('history')} className="text-sm text-orange-500 hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {invoices.slice(0, 3).map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                      onClick={() => {
                        setCurrentInvoice(invoice);
                        setView('pay');
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${invoice.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                          {invoice.status === 'paid' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{invoice.description || 'No description'}</p>
                          <p className="text-xs text-slate-500">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-100">{invoice.amountBtc} BTC</p>
                        <p className="text-xs text-slate-400">${parseFloat(invoice.amountUsd).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'create' && (
          <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-orange-500" /> Create New Invoice
              </h2>
              <form onSubmit={handleCreateInvoice} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Recipient BTC Address</label>
                  <input 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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
                    {amountBtc && price && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        ≈ ${(parseFloat(amountBtc) * price.usd).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
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
                      disabled={!description || isAiLoading}
                      className="text-xs text-orange-500 flex items-center gap-1 hover:underline disabled:opacity-50"
                    >
                      <BrainCircuit size={14} /> AI Professional Touch
                    </button>
                  </div>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Website design services..." 
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setView('home')}
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
        )}

        {view === 'pay' && currentInvoice && (
          <div className="max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
              {currentInvoice.status === 'paid' ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 border-2 border-green-500/30">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Payment Received!</h2>
                  <p className="text-slate-400">This invoice has been successfully paid on the blockchain.</p>
                  <button 
                    onClick={() => setView('home')}
                    className="bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold px-8 py-3 rounded-2xl transition-all mt-4"
                  >
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-full flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Complete Payment</h2>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => copyToClipboard(generateShareLink(currentInvoice))}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-all flex items-center gap-2 text-sm"
                        title="Share Invoice"
                      >
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                  </div>

                  <div className="mb-8 p-4 bg-white rounded-3xl shadow-xl">
                    <QRCode data={`bitcoin:${currentInvoice.recipientAddress}?amount=${currentInvoice.amountBtc}`} />
                  </div>

                  <div className="w-full space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Amount to Pay</p>
                        <p className="text-2xl font-mono font-bold text-orange-400">{currentInvoice.amountBtc} BTC</p>
                        <p className="text-sm text-slate-400">≈ ${parseFloat(currentInvoice.amountUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(currentInvoice.amountBtc)}
                        className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all active:scale-90"
                      >
                        <Copy size={20} />
                      </button>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Send to Address</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs break-all bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-300 flex-1">
                          {currentInvoice.recipientAddress}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(currentInvoice.recipientAddress)}
                          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all active:scale-90"
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 p-4 rounded-2xl text-center">
                      <p className="text-sm text-slate-400 italic">"{currentInvoice.description || 'No description provided'}"</p>
                    </div>

                    <div className="pt-4 space-y-3">
                      <button 
                        onClick={checkStatus}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                      >
                        Check Payment Status
                      </button>
                      <button 
                        onClick={() => window.open(`https://blockchair.com/bitcoin/address/${currentInvoice.recipientAddress}`, '_blank')}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                      >
                        View on Explorer <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Invoicing History</h2>
              <button 
                onClick={() => {
                  setInvoices([]);
                  localStorage.removeItem('invoice_flow_history_btc');
                }}
                className="text-xs text-red-400 hover:underline"
              >
                Clear History
              </button>
            </div>
            {invoices.length === 0 ? (
              <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-12 text-center text-slate-500">
                <History className="mx-auto mb-4 opacity-20" size={64} />
                <p>You haven't created any invoices yet.</p>
                <button 
                  onClick={() => setView('create')}
                  className="mt-4 text-orange-500 hover:underline"
                >
                  Create your first one
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl hover:bg-slate-800/60 transition-all cursor-pointer group"
                    onClick={() => {
                      setCurrentInvoice(invoice);
                      setView('pay');
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${invoice.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                          {invoice.status === 'paid' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-100 group-hover:text-orange-400 transition-colors">
                            {invoice.description || 'Untitled Request'}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Requested on {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center">
                        <div className="text-right">
                          <p className="text-xl font-mono font-bold text-slate-200">{invoice.amountBtc} BTC</p>
                          <p className="text-sm text-slate-400">${parseFloat(invoice.amountUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</p>
                        </div>
                        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {invoice.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Buttons / AI Assistant */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4">
        {showAiAssistant && (
          <div className="w-80 h-96 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-orange-500" size={18} />
                <span className="font-bold text-sm">Invoice Flow Assistant</span>
              </div>
              <button onClick={() => setShowAiAssistant(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none text-xs text-slate-300 max-w-[85%]">
                Hi! I can help you draft descriptions, calculate conversions, or explain how to pay with BTC. What's on your mind?
              </div>
              {chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-orange-500 text-slate-900 ml-auto rounded-tr-none' 
                      : 'bg-slate-800/50 text-slate-300 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isAiLoading && (
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-150" />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800">
              <div className="relative">
                <input 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiAssistance()}
                  placeholder="Ask anything..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button 
                  onClick={handleAiAssistance}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:scale-110 transition-transform"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
        <button 
          onClick={() => setShowAiAssistant(!showAiAssistant)}
          className="w-14 h-14 bg-orange-500 text-slate-900 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30 hover:scale-110 active:scale-90 transition-all z-50"
        >
          {showAiAssistant ? <X /> : <BrainCircuit />}
        </button>
      </div>

      {/* Copy Toast */}
      {isCopied && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-orange-500 text-slate-900 px-6 py-2 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <CheckCircle2 size={18} /> Copied!
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 w-full max-w-4xl text-center pb-8">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Invoice Flow. Built on Bitcoin (BTC).
        </p>
        <div className="flex justify-center gap-4 mt-4 text-slate-400">
          <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
