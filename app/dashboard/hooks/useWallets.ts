import { Address, Hex } from 'viem'
import { useState, useEffect } from 'react'
import { 
  createKernelAccount,
  createKernelAccountClient,
} from "@zerodev/sdk"
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { SignerType, Wallet } from '../types/wallet'
import { http } from 'viem'
import { base } from 'viem/chains'
import { getRpcProviderForChain } from '@/utils/provider'

type StoredWallet = {
  address: Address
  label: string
  username: string
  type: SignerType
  // For ECDSA wallets only
  privateKey?: string
}

// Constants
const BUNDLER_RPC = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL!
const ENTRY_POINT = '0x0000000071727De22E5E9d8BAf0edAc6f37da032' // EntryPoint 0.7
const kernelVersion = KERNEL_V3_1

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const publicClient = getRpcProviderForChain(base)

  useEffect(() => {
    loadStoredWallets()
  }, [])

  const loadStoredWallets = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]') as StoredWallet[]
      const loadedWallets: Wallet[] = stored.map(wallet => ({
        address: wallet.address,
        label: wallet.label,
        username: wallet.username,
        type: wallet.type,
        balances: []
      }))
      setWallets(loadedWallets)
    } catch (error) {
      console.error('Failed to load wallets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createWallet = async (data: { label: string, signerType: SignerType }) => {
    try {
      let storedData: StoredWallet

      if (data.signerType === 'passkey') {
        // TODO: Implement passkey flow once ZeroDev provides documentation
        throw new Error('Passkey implementation pending')
      } else {
        // Generate private key for local EOA
        const privateKey = generatePrivateKey()
        const signer = privateKeyToAccount(privateKey as Hex)

        // Create ECDSA validator
        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
          signer,
          entryPoint: ENTRY_POINT,
          kernelVersion
        })

        // Create kernel account
        const account = await createKernelAccount(publicClient, {
          plugins: {
            sudo: ecdsaValidator,
          },
          entryPoint: ENTRY_POINT,
          kernelVersion
        })

        // Create kernel client
        const kernelClient = createKernelAccountClient({
          account: account as any,
          entryPoint: ENTRY_POINT,
          chain: base,
          bundlerTransport: http(BUNDLER_RPC),
        })

        // test signing
        
        storedData = {
          address: account.address as Address,
          label: data.label,
          username: 'Local Key',
          type: 'localEOA',
          privateKey: privateKey // Store encrypted in production!
        }

        // Store wallet data
        const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]') as StoredWallet[]
        localStorage.setItem('storedWallets', JSON.stringify([...stored, storedData]))

        // Update state
        setWallets(prev => [...prev, {
          address: storedData.address,
          label: storedData.label,
          username: storedData.username,
          type: storedData.type,
          balances: []
        }])

        return storedData.address
      }
    } catch (error) {
      console.error('Failed to create wallet:', error)
      throw error
    }
  }

  const updateLabel = (address: Address, newLabel: string) => {
    setWallets(prev => 
      prev.map(wallet => 
        wallet.address === address 
          ? { ...wallet, label: newLabel }
          : wallet
      )
    )

    const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]') as StoredWallet[]
    const updated = stored.map(wallet => 
      wallet.address === address 
        ? { ...wallet, label: newLabel }
        : wallet
    )
    localStorage.setItem('storedWallets', JSON.stringify(updated))
  }

  return { 
    wallets, 
    isLoading, 
    createWallet,
    updateLabel 
  }
} 