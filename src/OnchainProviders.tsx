'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type Props = { children: ReactNode };
const queryClient = new QueryClient();

/**
 * TODO Docs ~~~
 */
function OnchainProviders({ children }: Props) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default OnchainProviders;
