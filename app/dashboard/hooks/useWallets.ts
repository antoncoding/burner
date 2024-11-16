import { Address } from 'viem'
import { useState, useEffect } from 'react'
import { Wallet } from '../types/wallet'

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Load wallets from storage/contract
    setIsLoading(false)
  }, [])

  const updateLabel = (address: Address, newLabel: string) => {
    setWallets(prev => 
      prev.map(wallet => 
        wallet.address === address 
          ? { ...wallet, label: newLabel }
          : wallet
      )
    )
    // Save to localStorage
    const labels = JSON.parse(localStorage.getItem('walletLabels') || '{}')
    localStorage.setItem('walletLabels', JSON.stringify({
      ...labels,
      [address]: newLabel
    }))
  }

  return { wallets, isLoading, updateLabel }
} 