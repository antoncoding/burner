import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { EntryPoint } from 'permissionless/types';
import { base, mainnet, optimism, arbitrum, Chain } from 'viem/chains';

type NetworkConfig = {
  [chainId: number]: {
    bundlerUrl: string;
    paymasterUrl: string;
    entryPoint: EntryPoint;
    chain: Chain;
    icon: string;
  };
};

export const NETWORK_CONFIG: NetworkConfig = {
  [mainnet.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_MAINNET_BUNDLER_URL || '',
    paymasterUrl: process.env.NEXT_PUBLIC_MAINNET_PAYMASTER_URL || '',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: mainnet,
    icon: '/chains/eth.png',
  },
  [base.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_BASE_BUNDLER_URL || '',
    paymasterUrl: process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL || '',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: base,
    icon: '/chains/base.webp',
  },
  [optimism.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_OPTIMISM_BUNDLER_URL || '',
    paymasterUrl: process.env.NEXT_PUBLIC_OPTIMISM_PAYMASTER_URL || '',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: optimism,
    icon: '/chains/op.png',
  },
  [arbitrum.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_ARBITRUM_BUNDLER_URL || '',
    paymasterUrl: process.env.NEXT_PUBLIC_ARBITRUM_PAYMASTER_URL || '',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: arbitrum,
    icon: '/chains/arb.png',
  },
};

export function getNetworkConfig(chainId: number) {
  const config = NETWORK_CONFIG[chainId];
  if (!config) {
    throw new Error(`No network config for chain ${chainId}`);
  }
  return config;
}
