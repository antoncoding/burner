import { Address } from 'viem'

export type TokenBalance = {
  symbol: 'USDC' | 'USDT'
  balance: string
  icon: string
}

export type Wallet = {
  address: Address
  label: string
  balances: TokenBalance[]
  username: string
}

export type SignerType = 'passkey' | 'localEOA'

export type CreateWalletFormData = {
  label: string
  signerType: SignerType
} 