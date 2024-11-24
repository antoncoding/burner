import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { EntryPoint } from 'permissionless/types';
import { base, mainnet, optimism, arbitrum, Chain } from 'viem/chains';

type NetworkConfig = {
  [chainId: number]: {
    bundlerUrl: string;
    paymasterUrl: string;
    entryPoint: EntryPoint;
    chain: Chain;
  };
};

export const NETWORK_CONFIG: NetworkConfig = {
  [mainnet.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_MAINNET_BUNDLER_URL || '',
    paymasterUrl: process.env.NEXT_PUBLIC_MAINNET_PAYMASTER_URL || '',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: mainnet,
  },
  [base.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_BASE_BUNDLER_URL || '',
    paymasterUrl: process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL || '',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: base,
  },
  [optimism.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_OPTIMISM_BUNDLER_URL || '',
    paymasterUrl: process.env.NEXT_PUBLIC_OPTIMISM_PAYMASTER_URL || '',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: optimism,
  },
  [arbitrum.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_ARBITRUM_BUNDLER_URL || '',
    paymasterUrl: process.env.NEXT_PUBLIC_ARBITRUM_PAYMASTER_URL || '',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: arbitrum,
  },
};

export function getNetworkConfig(chainId: number) {
  const config = NETWORK_CONFIG[chainId];
  if (!config) {
    throw new Error(`No network config for chain ${chainId}`);
  }
  return config;
}
