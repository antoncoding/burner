import { useState, useEffect, useCallback } from 'react'
import { Address } from 'viem'
import { SUPPORTED_STABLES } from '../config/tokens'

export type TokenAction = {
  chainId: string
  address: string
  standard: string
  fromAddress: string
  toAddress: string
  amount: string
  direction: 'In' | 'Out'
  priceToUsd: number
}

export type HistoryItem = {
  timeMs: number
  type: number
  direction: string
  details: {
    txHash: string
    chainId: number
    blockNumber: number
    blockTimeSec: number
    status: string
    type: string
    tokenActions: TokenAction[]
  }
}

export function useTokenHistory(address: Address) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/history?address=${address}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.items) {
        // Filter for supported tokens
        const filteredItems = data.items.filter((item: HistoryItem) => {
          return item.details.tokenActions?.some(action => {
            return SUPPORTED_STABLES.some(token => 
              token.networks.some(network => 
                network.address.toLowerCase() === action.address.toLowerCase()
              )
            )
          })
        })

        // Sort by timestamp descending
        filteredItems.sort((a: HistoryItem, b: HistoryItem) => b.timeMs - a.timeMs)
        setHistory(filteredItems)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchHistory()
  }, [address])

  return { history, isLoading, refetch: fetchHistory }
} 