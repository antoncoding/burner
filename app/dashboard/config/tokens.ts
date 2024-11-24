import { base, mainnet, optimism, arbitrum } from 'viem/chains';

type TokenConfig = {
  symbol: string;
  decimals: number;
  icon: string;
  networks: {
    chain: typeof mainnet | typeof base | typeof optimism | typeof arbitrum;
    address: string;
    fee?: bigint; // Fee in token's smallest unit (e.g., for USDC with 6 decimals, 2000000n = 2 USDC)
  }[];
};

export const FEE_RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_FEE_RECIPIENT_ADDRESS || '';

export const SUPPORTED_STABLES: TokenConfig[] = [
  {
    symbol: 'USDC',
    decimals: 6,
    icon: '/tokens/usdc.webp',
    networks: [
      { 
        chain: mainnet, 
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        fee: 2000000n // 2 USDC
      },
      { 
        chain: base, 
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        fee: 70000n // 0.07 USDC
      },
      { 
        chain: optimism, 
        address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        fee: 70000n // 0.07 USDC
      },
      { 
        chain: arbitrum, 
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        fee: 70000n // 0.07 USDC
      },
    ],
  },
  {
    symbol: 'DAI',
    decimals: 18,
    icon: '/tokens/dai.webp',
    networks: [
      { 
        chain: mainnet, 
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        fee: 2000000000000000000n // 2 DAI
      },
      { 
        chain: optimism, 
        address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        fee: 70000000000000000n // 0.07 DAI
      },
      { 
        chain: arbitrum, 
        address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        fee: 70000000000000000n // 0.07 DAI
      },
    ],
  },
  {
    symbol: 'USDe',
    decimals: 18,
    icon: '/tokens/usde.png',
    networks: [
      { 
        chain: mainnet, 
        address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
        fee: 2000000000000000000n // 2 USDe
      }
    ],
  },
  {
    symbol: 'USDT',
    decimals: 6,
    icon: '/tokens/usdt.webp',
    networks: [
      { 
        chain: mainnet, 
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        fee: 2000000n // 2 USDT
      },
      { 
        chain: optimism, 
        address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        fee: 70000n // 0.07 USDT
      },
      { 
        chain: arbitrum, 
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        fee: 70000n // 0.07 USDT
      },
    ],
  },
  {
    symbol: 'WETH',
    decimals: 18,
    icon: '/tokens/weth.webp',
    networks: [
      { 
        chain: mainnet, 
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        fee: 3000000000000000n // 0.003 WETH (around $6 at current prices)
      },
      { 
        chain: base, 
        address: '0x4200000000000000000000000000000000000006',
        fee: 1500000000000000n // 0.0015 WETH
      },
      { 
        chain: optimism, 
        address: '0x4200000000000000000000000000000000000006',
        fee: 1500000000000000n // 0.0015 WETH
      },
      { 
        chain: arbitrum, 
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        fee: 1500000000000000n // 0.0015 WETH
      },
    ],
  }
];
