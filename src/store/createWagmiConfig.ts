import { createConfig, http } from 'wagmi';
import { getChainsForEnvironment } from './supportedChains';
const chain = getChainsForEnvironment();

export function createWagmiConfig(rpcUrl: string) {
  return createConfig({
    chains: [chain],
    connectors: [],
    transports: {
      [chain.id]: http(rpcUrl),
    },
  });
}
