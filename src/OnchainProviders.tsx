'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createWagmiConfig } from '@/store/createWagmiConfig';

type Props = { children: ReactNode };
const queryClient = new QueryClient();

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? '';
const wagmiConfig = createWagmiConfig(rpcUrl);

/**
 * TODO Docs ~~~
 */
function OnchainProviders({ children }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default OnchainProviders;
export { wagmiConfig };
