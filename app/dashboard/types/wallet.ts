import { Address } from 'viem'
import { type Chain } from 'viem/chains'

export type TokenInfo = {
  symbol: string
  decimals: number
  icon: string
  networks: {
    chain: Chain
    address: string
  }[]
}

export type TokenBalance = {
  token: TokenInfo
  balance: string
  chain: Chain
}

export type SignerType = 'passkey' | 'localEOA' | 'biconomyEOA'

export type WalletVendor = 'zerodev' | 'biconomy'

export type Wallet = {
  address: Address
  label: string
  username: string
  type: SignerType
}

export type CreateWalletFormData = {
  label: string
  signerType: SignerType
  vendor?: WalletVendor
}

export type TokenTransfer = {
  token: TokenInfo
  chain: Chain
  from: Address
  to: Address
  value: string
  timestamp: number
  hash: `0x${string}`
  isIncoming: boolean
} 