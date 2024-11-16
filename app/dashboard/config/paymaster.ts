import { base, mainnet, optimism, arbitrum } from 'viem/chains'

type PaymasterConfig = {
  [chainId: number]: {
    rpcUrl: string
    entryPoint: `0x${string}`
  }
}

export const PAYMASTER_CONFIG: PaymasterConfig = {
  [mainnet.id]: {
    rpcUrl: process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_RPC_MAINNET!,
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
  },
  [base.id]: {
    rpcUrl: process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_RPC_BASE!,
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
  },
  [optimism.id]: {
    rpcUrl: process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_RPC_OPTIMISM!,
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
  },
  [arbitrum.id]: {
    rpcUrl: process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_RPC_ARBITRUM!,
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
  }
}

// Helper to get paymaster config for a chain
export function getPaymasterConfig(chainId: number) {
  const config = PAYMASTER_CONFIG[chainId]
  if (!config) {
    throw new Error(`No paymaster config for chain ${chainId}`)
  }
  return config
} 