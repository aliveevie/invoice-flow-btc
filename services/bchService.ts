
import { BTCPrice } from '../types';

/**
 * Fetches current BTC/USD price from a public API
 */
export const fetchBtcPrice = async (): Promise<BTCPrice> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const data = await response.json();
    return {
      usd: data['bitcoin'].usd,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return { usd: 90000, lastUpdated: Date.now() }; // Fallback price
  }
};

/**
 * Checks if a Bitcoin address has received a specific amount.
 */
export const checkPaymentStatus = async (address: string, expectedAmount: number): Promise<boolean> => {
  try {
    // Using Blockchair API for checking balance/transactions for Bitcoin
    const response = await fetch(`https://api.blockchair.com/bitcoin/dashboards/address/${address}`);
    const data = await response.json();
    const balanceSatoshis = data.data[address]?.address?.balance || 0;
    const balanceBtc = balanceSatoshis / 100000000;
    
    // Check if current balance is at least the expected amount
    return balanceBtc >= expectedAmount;
  } catch (error) {
    console.error('Error checking payment status:', error);
    return false;
  }
};

export const generateShareLink = (invoiceData: any) => {
  const encoded = btoa(JSON.stringify(invoiceData));
  return `${window.location.origin}/#/pay?data=${encoded}`;
};

export const decodeShareLink = (encodedData: string) => {
  try {
    return JSON.parse(atob(encodedData));
  } catch (e) {
    return null;
  }
};
