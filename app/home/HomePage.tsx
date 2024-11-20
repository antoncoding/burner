'use client';

import { motion } from 'framer-motion';
import { FiShield, FiZap, FiLock } from 'react-icons/fi';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: <FiShield className="h-6 w-6" />,
      title: 'Smart Account',
      description: 'Built on ERC-4337 smart accounts with account abstraction.',
    },
    {
      icon: <FiZap className="h-6 w-6" />,
      title: 'Gas in USDC',
      description: 'Pay gas fees in USDC. No ETH needed for transactions.',
    },
    {
      icon: <FiLock className="h-6 w-6" />,
      title: 'Secure & Simple',
      description: 'Choose between passkey or local key storage for security.',
    },
  ];

  return (
    <div className="bg-box-primary min-h-screen font-zen">
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          className="mx-auto mb-16 max-w-3xl text-center md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">Burner. Wallets</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
            Create unlimited burner wallets for receiving funds for different purposes.
          </p>
          <Link
            href="/dashboard"
            className="btn-primary inline-block rounded-lg px-8 py-3 text-lg no-underline transition-transform hover:scale-105"
          >
            Launch App
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-box-secondary rounded-lg p-6 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 text-center md:mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-box-secondary mx-auto max-w-3xl rounded-lg p-8 md:p-12">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Start?</h2>
            <p className="mb-6 text-gray-400">Create your first burner wallet in seconds.</p>
            <Link
              href="/dashboard"
              className="btn-primary inline-block rounded-lg px-8 py-3 no-underline transition-transform hover:scale-105"
            >
              Create Burner
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
