
export interface Invoice {
  id: string;
  recipientAddress: string;
  amountBtc: string;
  amountUsd: string;
  description: string;
  createdAt: number;
  status: 'pending' | 'paid' | 'expired';
}

export interface BTCPrice {
  usd: number;
  lastUpdated: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
