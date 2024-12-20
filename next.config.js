const { withSentryConfig } = require('@sentry/nextjs');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true, // Enable SWC minification for improved performance
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
  },
};

module.exports = withSentryConfig(withPWA(nextConfig), {
  org: 'alibuda',
  project: 'javascript-nextjs',

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: false, // Can be used to suppress logs
});
