import { Address, Hex } from 'viem'
import { useState, useEffect } from 'react'
import { 
  createKernelAccount,
  createKernelAccountClient
} from "@zerodev/sdk"
import { toPasskeyValidator, toWebAuthnKey, WebAuthnMode, PasskeyValidatorContractVersion } from "@zerodev/passkey-validator"
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { SignerType, Wallet } from '../types/wallet'
import { http } from 'viem'
import { base } from 'viem/chains'
import { getRpcProviderForChain } from '@/utils/provider'
import { getNetworkConfig } from '../config/networks'
import toast from 'react-hot-toast'

type StoredWallet = {
  address: Address
  label: string
  username: string
  type: SignerType
  privateKey?: string
}

const PASSKEY_SERVER_URL = 'https://passkeys.zerodev.app/api/v4'
const networkConfig = getNetworkConfig(base.id)
const publicClient = getRpcProviderForChain(base)

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        type: wallet.type
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
        // Create passkey validator
        const webAuthnKey = await toWebAuthnKey({ 
          passkeyName: data.label,
          passkeyServerUrl: PASSKEY_SERVER_URL,
          mode: WebAuthnMode.Register,
          passkeyServerHeaders: {}
        })

        const passkeyValidator = await toPasskeyValidator(publicClient, {
          webAuthnKey,
          entryPoint: networkConfig.entryPoint,
          kernelVersion: KERNEL_V3_1,
          validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
        })

        // Create kernel account
        const account = await createKernelAccount(publicClient, {
          plugins: {
            sudo: passkeyValidator,
          },
          entryPoint: networkConfig.entryPoint,
          kernelVersion: KERNEL_V3_1
        })

        // Create kernel client
        const kernelClient = createKernelAccountClient({
          account,
          entryPoint: networkConfig.entryPoint,
          chain: networkConfig.chain,
          bundlerTransport: http(networkConfig.bundlerUrl),
        })

        storedData = {
          address: account.address as Address,
          label: data.label,
          username: data.label, // Using label as username for passkey
          type: 'passkey'
        }
      } else {
        // Local EOA flow remains the same
        const privateKey = generatePrivateKey()
        const signer = privateKeyToAccount(privateKey as Hex)
        const validator = await signerToEcdsaValidator(publicClient, {
          signer,
          entryPoint: networkConfig.entryPoint,
          kernelVersion: KERNEL_V3_1
        })

        const account = await createKernelAccount(publicClient, {
          plugins: {
            sudo: validator,
          },
          entryPoint: networkConfig.entryPoint,
          kernelVersion: KERNEL_V3_1
        })

        storedData = {
          address: account.address as Address,
          label: data.label,
          username: 'Local Key',
          type: 'localEOA',
          privateKey
        }
      }

      // Store wallet data
      const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]') as StoredWallet[]
      localStorage.setItem('storedWallets', JSON.stringify([...stored, storedData]))

      // Update state
      setWallets(prev => [...prev, {
        address: storedData.address,
        label: storedData.label,
        username: storedData.username,
        type: storedData.type
      }])

      return storedData.address
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

  const burnWallet = async (address: Address) => {
    try {
      // Get stored wallets
      const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]') as StoredWallet[]
      
      // Remove wallet from storage
      const updatedWallets = stored.filter(w => w.address !== address)
      localStorage.setItem('storedWallets', JSON.stringify(updatedWallets))

      // Update state
      setWallets(prev => prev.filter(w => w.address !== address))

      toast.success('🔥 Wallet burned successfully')
    } catch (error) {
      console.error('Failed to burn wallet:', error)
      toast.error('Failed to burn wallet')
      throw error
    }
  }

  return { 
    wallets, 
    isLoading, 
    createWallet,
    updateLabel,
    burnWallet
  }
} 