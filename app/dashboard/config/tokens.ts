import { base, mainnet, optimism, arbitrum } from 'viem/chains'

type TokenConfig = {
  symbol: string
  decimals: number
  icon: string
  networks: {
    chain: typeof mainnet | typeof base | typeof optimism | typeof arbitrum
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
      { chain: optimism, address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' },
      { chain: arbitrum, address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' }
    ],
  },
  {
    symbol: 'USDT',
    decimals: 6,
    icon: '/tokens/usdt.webp',
    networks: [
      { chain: mainnet, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
      { chain: optimism, address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' },
      { chain: arbitrum, address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' }
    ],
  },
  {
    symbol: 'DAI',
    decimals: 18,
    icon: '/tokens/dai.webp',
    networks: [
      { chain: mainnet, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      { chain: optimism, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' },
      { chain: arbitrum, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' }
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