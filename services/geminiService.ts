
	import { GoogleGenAI } from '@google/genai';
	import { clearGeminiApiKey, loadGeminiApiKey, saveGeminiApiKey } from '@/services/storage';

	type GeminiConfig = {
	  model?: string;
	};

	const DEFAULT_MODEL = 'gemini-3-flash-preview';

	export class MissingGeminiApiKeyError extends Error {
	  name = 'MissingGeminiApiKeyError';
	  constructor() {
	    super('Missing Gemini API key');
	  }
	}

	function getEffectiveGeminiApiKey(): string | null {
	  return loadGeminiApiKey() ?? (process.env.API_KEY ? String(process.env.API_KEY) : null);
	}

	function createClientOrThrow(): GoogleGenAI {
	  const apiKey = getEffectiveGeminiApiKey();
	  if (!apiKey) throw new MissingGeminiApiKeyError();
	  return new GoogleGenAI({ apiKey });
	}

	export function hasGeminiApiKey(): boolean {
	  return Boolean(getEffectiveGeminiApiKey());
	}

	export function setGeminiApiKey(apiKey: string): void {
	  saveGeminiApiKey(apiKey);
	}

	export function unsetGeminiApiKey(): void {
	  clearGeminiApiKey();
	}

	export const getInvoiceAssistance = async (prompt: string, config: GeminiConfig = {}) => {
	  const ai = createClientOrThrow();
	  const response = await ai.models.generateContent({
	    model: config.model ?? DEFAULT_MODEL,
	    contents: prompt,
	    config: {
	      systemInstruction:
	        "You are an AI assistant for 'Invoice Flow', a Bitcoin (BTC) P2P payment app. Help users draft professional invoice descriptions, calculate currency conversions, or explain how Bitcoin works. Keep responses concise and friendly.",
	    },
	  });
	  return response.text;
	};

	export const suggestDescription = async (context: string, config: GeminiConfig = {}) => {
	  const ai = createClientOrThrow();
	  const response = await ai.models.generateContent({
	    model: config.model ?? DEFAULT_MODEL,
	    contents: `Write a professional 1-sentence invoice description for: ${context}`,
	  });
	  return response.text;
	};
