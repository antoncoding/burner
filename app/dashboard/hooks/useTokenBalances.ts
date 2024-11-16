import { useState, useEffect, useCallback } from 'react'
import { Address, formatUnits } from 'viem'
import { base, mainnet } from 'viem/chains'
import { SUPPORTED_STABLES } from '../config/tokens'
import { getRpcProviderForChain } from '@/utils/provider'
import { TokenBalance } from '../types/wallet'
import { erc20Abi } from 'viem'
import toast from 'react-hot-toast'

// Create clients outside the hook
const mainnetClient = getRpcProviderForChain(mainnet)
const baseClient = getRpcProviderForChain(base)

// Global loading state
let isGlobalFetching = false

const toastStyle = {
  style: {
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-background-hovered)',
    padding: '16px',
    borderRadius: '12px',
  },
  iconTheme: {
    primary: '#22c55e', // Using a softer green
    secondary: '#FFFFFF',
  },
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

    const totalTokens = allBalances.reduce((sum, balances) => sum + balances.length, 0)
    
    toast.success(`✨ Updated ${addresses.length} wallets`, {
      ...toastStyle,
      id: toastId
    })

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
  const balancePromises: Promise<TokenBalance | null>[] = []

  SUPPORTED_STABLES.forEach(token => {
    token.networks.forEach(network => {
      const client = network.chain.id === base.id ? baseClient : mainnetClient
      
      const promise = client.readContract({
        address: network.address as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      }).then(balance => {
        const formattedBalance = formatUnits(balance, token.decimals)
        if (parseFloat(formattedBalance) > 0) {
          return {
            token,
            balance: formattedBalance,
            chain: network.chain
          } as TokenBalance
        }
        return null
      }).catch(() => null)

      balancePromises.push(promise)
    })
  })

  const results = await Promise.all(balancePromises)
  return results.filter((b): b is TokenBalance => b !== null)
}

// Hook for individual wallet balances
export function useTokenBalances(address: Address) {
  const [balances, setBalances] = useState<TokenBalance[]>([])

  const fetchBalances = useCallback(async () => {
    const newBalances = await fetchBalancesForAddress(address)
    setBalances(newBalances)
  }, [address])

  useEffect(() => {
    fetchBalances()
  }, [address])

  return { balances, refetch: fetchBalances }
} 