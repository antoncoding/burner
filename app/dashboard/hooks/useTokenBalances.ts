import { useState, useEffect, useCallback } from 'react'
import { Address, formatUnits } from 'viem'
import { base, mainnet, optimism, arbitrum } from 'viem/chains'
import { SUPPORTED_STABLES } from '../config/tokens'
import { TokenBalance } from '../types/wallet'
import toast from 'react-hot-toast'

// Global loading state
let isGlobalFetching = false

const INCH_API_KEY = '0rSrfQPlKkOGeEmJ1dVENdgnJhkDjSWt'

const CHAIN_IDS = {
  [mainnet.id]: '1',
  [base.id]: '8453',
  [optimism.id]: '10',
  [arbitrum.id]: '42161'
}

const toastStyle = {
  style: {
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-background-hovered)',
    padding: '16px',
    borderRadius: '12px',
  },
  iconTheme: {
    primary: '#22c55e',
    secondary: '#FFFFFF',
  },
}

async function fetch1inchBalances(address: Address, chainId: number): Promise<Record<string, string>> {
  try {
    const response = await fetch(
      `/api/balances?address=${address}&chainId=${chainId}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch balances for chain ${chainId}:`, error)
    return {}
  }
}

// Create a global fetch function
export async function fetchAllBalances(addresses: Address[]) {
  if (isGlobalFetching) return
  isGlobalFetching = true

  const toastId = toast.loading('🔍 Scanning all wallets...', toastStyle)

  try {
    const allBalances = await Promise.all(addresses.map(address => 
      fetchBalancesForAddress(address)
    ))

    toast.success(`✨ Updated ${addresses.length} wallets`, {
      ...toastStyle,
      id: toastId
    })

    // Emit an event that individual hooks can listen to
    window.dispatchEvent(new CustomEvent('balancesUpdated', {
      detail: { addresses }
    }))

    return allBalances
  } catch (error) {
    console.error('Failed to fetch balances:', error)
    toast.error('😅 Failed to update some balances', {
      ...toastStyle,
      id: toastId
    })
  } finally {
    isGlobalFetching = false
  }
}

// Helper function to fetch balances for a single address
async function fetchBalancesForAddress(address: Address): Promise<TokenBalance[]> {
  const balances: TokenBalance[] = []

  // Fetch balances for each supported chain
  for (const chainId of Object.keys(CHAIN_IDS).map(Number)) {
    const rawBalances = await fetch1inchBalances(address, chainId)
    
    // For each supported token, check if we have a balance
    SUPPORTED_STABLES.forEach(token => {
      const networkConfig = token.networks.find(n => n.chain.id === chainId)
      if (!networkConfig) return

      const balance = rawBalances[networkConfig.address.toLowerCase()]
      if (balance && BigInt(balance) > 0n) {
        balances.push({
          token,
          balance: formatUnits(BigInt(balance), token.decimals),
          chain: networkConfig.chain
        })
      }
    })
  }

  return balances
}

// Hook for individual wallet balances
export function useTokenBalances(address: Address) {
  const [balances, setBalances] = useState<TokenBalance[]>([])

  const fetchBalances = useCallback(async () => {
    const newBalances = await fetchBalancesForAddress(address)
    setBalances(newBalances)
  }, [address])

  // Initial fetch
  useEffect(() => {
    fetchBalances()
  }, [address])

  // Listen for global balance updates
  useEffect(() => {
    const handleBalancesUpdated = (event: CustomEvent<{ addresses: Address[] }>) => {
      if (event.detail.addresses.includes(address)) {
        fetchBalances()
      }
    }

    window.addEventListener('balancesUpdated', handleBalancesUpdated as EventListener)
    return () => window.removeEventListener('balancesUpdated', handleBalancesUpdated as EventListener)
  }, [address, fetchBalances])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBalances, 30000)
    return () => clearInterval(interval)
  }, [fetchBalances])

  return { balances, refetch: fetchBalances, isLoading: isGlobalFetching }
} 