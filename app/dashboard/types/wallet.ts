import { Address } from 'viem'

export type TokenBalance = {
  symbol: 'USDC' | 'USDT'
  balance: string
  icon: string
}

export type SignerType = 'passkey' | 'localEOA'

export type Wallet = {
  address: Address
  label: string
  username: string
  type: SignerType
}

export type CreateWalletFormData = {
  label: string
  signerType: SignerType
} 