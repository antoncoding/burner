import { useState, useEffect, useCallback } from 'react';
import { Address, formatUnits } from 'viem';
import { base, mainnet, optimism, arbitrum } from 'viem/chains';
import { SUPPORTED_STABLES } from '../config/tokens';
import { TokenBalance, TokenMetadata } from '../types/wallet';
import toast from 'react-hot-toast';

// Global loading state
let isGlobalFetching = false;

const CHAIN_IDS = {
  [mainnet.id]: '1',
  [base.id]: '8453',
  [optimism.id]: '10',
  [arbitrum.id]: '42161',
};

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchAllBalances(addresses: Address[]) {
  if (isGlobalFetching) return;
  isGlobalFetching = true;

  const toastId = toast.loading('🔍 Scanning all wallets...', {
    style: {
      background: 'var(--color-background-secondary)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-background-hovered)',
      padding: '16px',
      borderRadius: '12px',
    },
  });

  try {
    const allBalances = await Promise.all(
      addresses.map(async (address, addressIndex) => {
        if (addressIndex > 0) {
          await delay(1100);
        }

        const chainBalances = await Promise.all(
          Object.values(CHAIN_IDS).map(async (chainId, chainIndex) => {
            if (chainIndex > 0) {
              await delay(1100);
            }

            try {
              const response = await fetch(`/api/balances?address=${address}&chainId=${chainId}`);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              const data = await response.json();
              return { chainId, data };
            } catch (error) {
              console.error(`Failed to fetch balances for chain ${chainId}:`, error);
              return { chainId, data: null };
            }
          })
        );

        return { address, balances: chainBalances };
      })
    );

    toast.success(`✨ Updated ${addresses.length} wallets`, { id: toastId });
    window.dispatchEvent(new CustomEvent('balancesUpdated', {
      detail: { results: allBalances }
    }));

    return allBalances;
  } catch (error) {
    console.error('Failed to fetch balances:', error);
    toast.error('😅 Failed to update some balances', { id: toastId });
  } finally {
    isGlobalFetching = false;
  }
}

export function useTokenBalances(address: Address) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const processTokenData = (tokens: TokenMetadata[], chainId: number) => {
    return SUPPORTED_STABLES.flatMap(supportedToken => {
      const networkConfig = supportedToken.networks.find(n => n.chain.id === chainId);
      if (!networkConfig) return [];

      const token = tokens.find(t => 
        t.address.toLowerCase() === networkConfig.address.toLowerCase()
      );
      
      if (!token) return [];

      return [{
        token: supportedToken,
        balance: formatUnits(BigInt(token.balance), token.decimals),
        chain: networkConfig.chain,
        metadata: token
      }];
    });
  }

  const fetchBalances = useCallback(async () => {
    setIsLoading(true);

    try {
      const chainBalances = await Promise.all(
        Object.entries(CHAIN_IDS).map(async ([_, chainId], index) => {
          if (index > 0) {
            await delay(1100);
          }

          const response = await fetch(`/api/balances?address=${address}&chainId=${chainId}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const data = await response.json();
          return { chainId: Number(chainId), tokens: data.tokens || [] };
        })
      );

      const processedBalances = chainBalances.flatMap(({ chainId, tokens }) => 
        processTokenData(tokens, chainId)
      );

      setBalances(processedBalances);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Initial fetch
  useEffect(() => {
    fetchBalances();
  }, [address]);

  // Listen for global balance updates
  useEffect(() => {
    const handleBalancesUpdated = (event: CustomEvent<{ results: { address: Address, balances: any[] }[] }>) => {
      const result = event.detail.results.find(r => r.address === address);
      if (result?.balances) {
        const processedBalances = result.balances.flatMap(({ chainId, data }) => 
          data?.tokens ? processTokenData(data.tokens, Number(chainId)) : []
        );
        setBalances(processedBalances);
      }
    }

    window.addEventListener('balancesUpdated', handleBalancesUpdated as EventListener);
    return () => window.removeEventListener('balancesUpdated', handleBalancesUpdated as EventListener);
  }, [address]);

  return { balances, isLoading, refetch: fetchBalances };
}
