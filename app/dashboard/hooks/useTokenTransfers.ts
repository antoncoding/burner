import { useState, useEffect } from 'react'
import { Address, formatUnits, parseAbiItem } from 'viem'
import { base, mainnet, optimism, arbitrum } from 'viem/chains'
import { SUPPORTED_STABLES } from '../config/tokens'
import { getRpcProviderForChain } from '@/utils/provider'
import { TokenTransfer } from '../types/wallet'

// Create clients for each network
const mainnetClient = getRpcProviderForChain(mainnet)
const baseClient = getRpcProviderForChain(base)
const optimismClient = getRpcProviderForChain(optimism)
const arbitrumClient = getRpcProviderForChain(arbitrum)

// Helper to get the appropriate client
const getClientForChain = (chainId: number) => {
  switch (chainId) {
    case base.id:
      return baseClient
    case optimism.id:
      return optimismClient
    case arbitrum.id:
      return arbitrumClient
    default:
      return mainnetClient
  }
}

// Helper to get appropriate block range based on chain
const getFromBlock = (chainId: number) => {
  switch (chainId) {
    case base.id:
      return -7000n // ~1 day
    case optimism.id:
      return -50000n // ~1 day
    case arbitrum.id:
      return -100000n // ~1 day
    default:
      return -10000n // Ethereum mainnet
  }
}

// ERC20 Transfer event signature
const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)')

export function useTokenTransfers(address: Address) {
  const [transfers, setTransfers] = useState<TokenTransfer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTransfers()
  }, [address])

  const fetchTransfers = async () => {
    setIsLoading(true)
    const allTransfers: TokenTransfer[] = []

    try {
      // For each supported token
      for (const token of SUPPORTED_STABLES) {
        // For each network the token is on
        for (const network of token.networks) {
          const client = getClientForChain(network.chain.id)
          const fromBlock = getFromBlock(network.chain.id)

          try {
            // Get both incoming and outgoing transfers
            const logs = await client.getLogs({
              address: network.address as Address,
              event: transferEvent,
              args: {
                from: address as Address,
                to: address as Address,
              } as any,
              fromBlock,
            })

            // Format transfers
            const formattedTransfers = logs.map(log => ({
              token,
              chain: network.chain,
              from: log.args.from as Address,
              to: log.args.to as Address,
              value: formatUnits(log.args.value as bigint, token.decimals),
              timestamp: Number(log.blockNumber),
              hash: log.transactionHash,
              isIncoming: (log.args.to as string).toLowerCase() === address.toLowerCase()
            }))

            allTransfers.push(...formattedTransfers)
          } catch (error) {
            console.warn(`Failed to fetch transfers for ${token.symbol} on ${network.chain.name}:`, error)
            // Continue with other tokens/networks
          }
        }
      }

      // Sort by block number (timestamp) descending
      allTransfers.sort((a, b) => b.timestamp - a.timestamp)
      setTransfers(allTransfers)
    } catch (error) {
      console.error('Failed to fetch transfers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { transfers, isLoading, refetch: fetchTransfers }
} 