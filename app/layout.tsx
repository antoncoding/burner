import './global.css';

import GoogleAnalytics from '@/components/GoogleAnalytics/GoogleAnalytics';
import Providers from './Providers';
import { initAnalytics } from '@/utils/analytics';
import { zen, inter, monospace } from './fonts';
import { Metadata } from 'next';

// Stat analytics before the App renders,
// so we can track page views and early events
initAnalytics();

export const metadata: Metadata = {
  title: 'Burner',
  description: 'One-time wallets for one-time use.',
  manifest: '/manifest.json',
  generator: 'Next.js',
  viewport:
    'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  icons: [
    { rel: 'apple-touch-icon', url: 'icons/512x512.png' },
    { rel: 'icon', url: 'icons/512x512.png' },
  ],
};

/** Root layout to define the structure of every page
 * https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${zen.variable} ${inter.variable} ${monospace.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics />
    </html>
  );
}
