import { useState, useEffect } from 'react'
import { Address, formatUnits } from 'viem'
import { base, mainnet } from 'viem/chains'
import { SUPPORTED_STABLES } from '../config/tokens'
import { getRpcProviderForChain } from '@/utils/provider'
import { TokenBalance } from '../types/wallet'
import { erc20Abi } from 'viem'

export function useTokenBalances(address: Address) {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const mainnetClient = getRpcProviderForChain(mainnet)
  const baseClient = getRpcProviderForChain(base)

  useEffect(() => {
    fetchBalances()
  }, [address])

  const fetchBalances = async () => {
    try {
      const balancePromises: Promise<TokenBalance | null>[] = []

      // For each supported token
      SUPPORTED_STABLES.forEach(token => {
        // For each network the token is on
        token.networks.forEach(network => {
          const client = network.chain.id === base.id ? baseClient : mainnetClient
          
          const promise = client.readContract({
            address: network.address as Address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address],
          }).then(balance => {
            const formattedBalance = formatUnits(balance, token.decimals)
            // Only return balances > 0
            if (parseFloat(formattedBalance) > 0) {
              return {
                symbol: token.symbol,
                balance: formattedBalance,
                icon: token.icon
              } as TokenBalance
            }
            return null
          }).catch(() => null) // Ignore failed balance checks

          balancePromises.push(promise)
        })
      })

      const results = await Promise.all(balancePromises)
      const nonZeroBalances = results.filter((b): b is TokenBalance => b !== null)
      setBalances(nonZeroBalances)
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { balances, isLoading }
} 