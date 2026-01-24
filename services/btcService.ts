
	import type { BTCPrice, Invoice } from '@/types';
	import { buildPayHash, buildShareLink, decodeShareDataToInvoice, encodeInvoiceToShareData } from '@/services/shareLink';

	/**
	 * Fetches current BTC/USD price from Blockchain.info (Public, No Key required)
	 */
	export const fetchBtcPrice = async (): Promise<BTCPrice> => {
	  const signal = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(10_000) : undefined;
	  try {
	    const response = await fetch('https://blockchain.info/ticker', signal ? { signal } : undefined);
	    const data = await response.json();
	    if (!data?.USD?.last || typeof data.USD.last !== 'number') {
	      throw new Error('Unexpected ticker format from Blockchain.info');
	    }
	    return {
	      usd: data.USD.last,
	      lastUpdated: Date.now(),
	    };
	  } catch (error) {
	    console.error('Error fetching BTC price:', error);
	    // Attempt fallback to Coinbase if Blockchain.info fails
	    try {
	      const cbResponse = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', signal ? { signal } : undefined);
	      const cbData = await cbResponse.json();
	      const amount = cbData?.data?.amount;
	      const parsed = typeof amount === 'string' ? Number(amount) : NaN;
	      if (!Number.isFinite(parsed)) {
	        throw new Error('Unexpected ticker format from Coinbase');
	      }
	      return {
	        usd: parsed,
	        lastUpdated: Date.now(),
	      };
	    } catch (innerError) {
	      throw new Error('Could not fetch BTC price from any provider');
	    }
	  }
	};

	/**
	 * Checks if a Bitcoin address has received a specific amount using Blockchair.
	 */
	export const checkPaymentStatus = async (address: string, expectedAmount: number): Promise<boolean> => {
	  try {
	    const signal = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(15_000) : undefined;
	    const response = await fetch(`https://api.blockchair.com/bitcoin/dashboards/address/${address}`, signal ? { signal } : undefined);
	    if (!response.ok) return false;
	    const data = await response.json();
	    const balanceSatoshis = data.data[address]?.address?.balance || 0;
	    const balanceBtc = balanceSatoshis / 100000000;
	    
	    return balanceBtc >= expectedAmount;
	  } catch (error) {
	    console.error('Error checking payment status:', error);
	    return false;
	  }
	};

	export const generatePayHash = (invoice: Invoice): string => {
	  const encoded = encodeInvoiceToShareData(invoice);
	  return buildPayHash(encoded);
	};

	export const generateShareLink = (invoice: Invoice): string => {
	  const encoded = encodeInvoiceToShareData(invoice);
	  return buildShareLink(encoded);
	};

	export const decodeShareLink = (encodedData: string): Invoice | null => {
	  return decodeShareDataToInvoice(encodedData);
	};
