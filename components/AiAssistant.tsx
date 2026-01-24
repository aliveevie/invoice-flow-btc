import React, { useState } from 'react';
import { BrainCircuit, Send, X } from 'lucide-react';
import type { ChatMessage } from '@/types';
import {
  getInvoiceAssistance,
  hasGeminiApiKey,
  MissingGeminiApiKeyError,
  setGeminiApiKey,
  unsetGeminiApiKey,
} from '@/services/geminiService';

export type AiAssistantProps = {
  onToast: (message: string, tone: 'success' | 'error' | 'info') => void;
};

export function AiAssistant({ onToast }: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const hasKey = hasGeminiApiKey();

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setIsAiLoading(true);

    const msg: ChatMessage = { role: 'user', text: userInput.trim() };
    setChatHistory((prev) => [...prev, msg]);
    setUserInput('');

    try {
      const response = await getInvoiceAssistance(msg.text);
      if (response) setChatHistory((prev) => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      if (err instanceof MissingGeminiApiKeyError) {
        onToast('Add a Gemini API key to use the assistant.', 'info');
      } else {
        onToast('Assistant request failed. Try again.', 'error');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4">
      {open && (
        <div className="w-80 h-[28rem] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-slate-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-orange-500" size={18} />
              <span className="font-bold text-sm">Invoice Flow Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {!hasKey && (
            <div className="p-4 border-b border-slate-800 bg-slate-950/30">
              <p className="text-xs text-slate-400 mb-2">Add a Gemini API key to enable AI features (stored locally in this browser).</p>
              <div className="flex gap-2">
                <input
                  value={apiKeyDraft}
                  onChange={(e) => setApiKeyDraft(e.target.value)}
                  placeholder="GEMINI_API_KEY"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={() => {
                    if (!apiKeyDraft.trim()) return;
                    setGeminiApiKey(apiKeyDraft);
                    setApiKeyDraft('');
                    onToast('API key saved.', 'success');
                  }}
                  className="px-3 py-2 rounded-xl bg-orange-500 text-slate-900 text-xs font-bold hover:bg-orange-600 transition-colors"
                >
                  Save
                </button>
              </div>
              <button
                onClick={() => {
                  unsetGeminiApiKey();
                  onToast('API key removed.', 'info');
                }}
                className="mt-2 text-xs text-slate-400 hover:underline"
              >
                Remove saved key
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none text-xs text-slate-300 max-w-[85%]">
              Hi! I can help you draft invoice descriptions, calculate conversions, or explain how to pay with BTC.
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder={hasKey ? 'Ask anything…' : 'Add an API key to chat…'}
                disabled={!hasKey}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!hasKey || isAiLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:scale-110 transition-transform disabled:opacity-60"
                title="Send"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 bg-orange-500 text-slate-900 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30 hover:scale-110 active:scale-90 transition-all z-50"
        title="AI Assistant"
      >
        {open ? <X /> : <BrainCircuit />}
      </button>
    </div>
  );
}
