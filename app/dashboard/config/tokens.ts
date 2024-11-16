import { base, mainnet } from 'viem/chains'

type TokenConfig = {
  symbol: string
  decimals: number
  icon: string
  networks: {
    chain: typeof mainnet | typeof base
    address: string
  }[]
}

export const SUPPORTED_STABLES: TokenConfig[] = [
  {
    symbol: 'USDC',
    decimals: 6,
    icon: '/tokens/usdc.webp',
    networks: [
      { chain: mainnet, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
      { chain: base, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    ],
  },
  {
    symbol: 'USDT',
    decimals: 6,
    icon: '/tokens/usdt.webp',
    networks: [
      { chain: mainnet, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' }
    ],
  },
  {
    symbol: 'DAI',
    decimals: 18,
    icon: '/tokens/dai.webp',
    networks: [
      { chain: mainnet, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' }
    ],
  },
  {
    symbol: 'USDe',
    decimals: 18,
    icon: '/tokens/usde.png',
    networks: [
      { chain: mainnet, address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3' },
    ],
  }
] 