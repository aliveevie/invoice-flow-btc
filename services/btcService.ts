
import { BTCPrice } from '../types';

/**
 * Fetches current BTC/USD price from Blockchain.info (Public, No Key required)
 */
export const fetchBtcPrice = async (): Promise<BTCPrice> => {
  try {
    const response = await fetch('https://blockchain.info/ticker');
    const data = await response.json();
    return {
      usd: data.USD.last,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    // Attempt fallback to Coinbase if Blockchain.info fails
    try {
      const cbResponse = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      const cbData = await cbResponse.json();
      return {
        usd: parseFloat(cbData.data.amount),
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
    const response = await fetch(`https://api.blockchair.com/bitcoin/dashboards/address/${address}`);
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
