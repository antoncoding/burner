'use client';

import './global.css';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import OnchainProviders from '@/OnchainProviders';
import { NextUIProvider } from '@nextui-org/system';
import { ThemeProvider } from 'next-themes';

/** Root layout to define the structure of every page
 * https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OnchainProviders>
      <ThemeProvider disableTransitionOnChange attribute="class">
        <NextUIProvider>
          <RainbowKitProvider
            theme={{
              lightMode: lightTheme(),
              darkMode: darkTheme(),
            }}
          >
            {children}
          </RainbowKitProvider>
        </NextUIProvider>
      </ThemeProvider>
    </OnchainProviders>
  );
}
