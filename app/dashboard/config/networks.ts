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
    bundlerUrl: 'https://rpc.zerodev.app/api/v2/bundler/e7354385-1f40-4b2f-8939-fb30b2986090',
    paymasterUrl: 'https://rpc.zerodev.app/api/v2/paymaster/e7354385-1f40-4b2f-8939-fb30b2986090',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: mainnet,
  },
  [base.id]: {
    bundlerUrl: 'https://rpc.zerodev.app/api/v2/bundler/9df19371-f92e-4115-b36c-1be5ef1db6c0',
    paymasterUrl: 'https://rpc.zerodev.app/api/v2/paymaster/9df19371-f92e-4115-b36c-1be5ef1db6c0',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: base,
  },
  [optimism.id]: {
    bundlerUrl: 'https://rpc.zerodev.app/api/v2/bundler/56a20d60-be0e-4c29-9c09-5bbe55fb0565',
    paymasterUrl: 'https://rpc.zerodev.app/api/v2/paymaster/56a20d60-be0e-4c29-9c09-5bbe55fb0565',
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: optimism,
  },
  [arbitrum.id]: {
    bundlerUrl: 'https://rpc.zerodev.app/api/v2/bundler/f8b81555-26bd-4b32-b129-db97775f0085',
    paymasterUrl: 'https://rpc.zerodev.app/api/v2/paymaster/f8b81555-26bd-4b32-b129-db97775f0085',
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
