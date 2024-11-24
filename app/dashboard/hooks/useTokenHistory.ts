import { useState, useEffect, useCallback } from 'react';
import { Address } from 'viem';
import { SUPPORTED_STABLES } from '../config/tokens';

export type TokenAction = {
  chainId: string;
  address: string;
  standard: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  direction: 'In' | 'Out';
  priceToUsd: number;
};

export type HistoryItem = {
  timeMs: number;
  type: number;
  direction: string;
  details: {
    txHash: string;
    chainId: number;
    blockNumber: number;
    blockTimeSec: number;
    status: string;
    type: string;
    tokenActions: TokenAction[];
  };
};

// Helper function to add delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Global fetch function for multiple addresses
export async function fetchAllHistory(addresses: Address[]) {
  const allHistory = [];

  // Sequential fetching with delay
  for (const address of addresses) {
    try {
      const response = await fetch(`/api/history?address=${address}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      allHistory.push({ address, data });

      // Add 1.2 second delay between requests
      if (addresses.indexOf(address) < addresses.length - 1) {
        await delay(1200);
      }
    } catch (error) {
      console.error(`Failed to fetch history for ${address}:`, error);
      allHistory.push({ address, data: null });
    }
  }

  // Emit event with results
  window.dispatchEvent(
    new CustomEvent('historyUpdated', {
      detail: { results: allHistory },
    }),
  );

  return allHistory;
}

export function useTokenHistory(address: Address) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/history?address=${address}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.items) {
        // Filter for supported tokens
        const filteredItems = data.items.filter((item: HistoryItem) => {
          return item.details.tokenActions?.some((action) => {
            return SUPPORTED_STABLES.some((token) =>
              token.networks.some(
                (network) => network.address.toLowerCase() === action.address.toLowerCase(),
              ),
            );
          });
        });

        // Sort by timestamp descending
        filteredItems.sort((a: HistoryItem, b: HistoryItem) => b.timeMs - a.timeMs);
        setHistory(filteredItems);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Initial fetch
  useEffect(() => {
    fetchHistory();
  }, [address]);

  // Listen for global history updates
  useEffect(() => {
    const handleHistoryUpdated = (
      event: CustomEvent<{ results: { address: Address; data: any }[] }>,
    ) => {
      const result = event.detail.results.find((r) => r.address === address);
      if (result?.data?.items) {
        const filteredItems = result.data.items.filter((item: HistoryItem) => {
          return item.details.tokenActions?.some((action) => {
            return SUPPORTED_STABLES.some((token) =>
              token.networks.some(
                (network) => network.address.toLowerCase() === action.address.toLowerCase(),
              ),
            );
          });
        });
        filteredItems.sort((a: HistoryItem, b: HistoryItem) => b.timeMs - a.timeMs);
        setHistory(filteredItems);
      }
    };

    window.addEventListener('historyUpdated', handleHistoryUpdated as EventListener);
    return () =>
      window.removeEventListener('historyUpdated', handleHistoryUpdated as EventListener);
  }, [address]);

  return { history, isLoading, refetch: fetchHistory };
}
