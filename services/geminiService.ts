
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInvoiceAssistance = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are an AI assistant for 'Invoice Flow', a Bitcoin (BTC) P2P payment app. Help users draft professional invoice descriptions, calculate currency conversions, or explain how Bitcoin works. Keep responses concise and friendly.",
    },
  });
  return response.text;
};

export const suggestDescription = async (context: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional 1-sentence invoice description for: ${context}`,
  });
  return response.text;
};
