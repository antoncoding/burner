'use client';

import { motion } from 'framer-motion';
import { FiShield, FiZap, FiLock } from 'react-icons/fi';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'Smart Account',
      description: 'Built on ERC-4337 smart accounts with account abstraction.'
    },
    {
      icon: <FiZap className="w-6 h-6" />,
      title: 'Gas in USDC',
      description: 'Pay gas fees in USDC. No ETH needed for transactions.'
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: 'Secure & Simple',
      description: 'Choose between passkey or local key storage for security.'
    }
  ]

  return (
    <div className="min-h-screen bg-box-primary font-zen">
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple Burner Wallets
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Create unlimited burner wallets for receiving funds for different purposes.
          </p>
          <Link 
            href="/dashboard"
            className="btn-primary text-lg px-8 py-3 rounded-lg inline-block no-underline hover:scale-105 transition-transform"
          >
            Launch App
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-box-secondary p-6 md:p-8 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-16 md:mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-box-secondary max-w-3xl mx-auto rounded-lg p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start?
            </h2>
            <p className="text-gray-400 mb-6">
              Create your first burner wallet in seconds.
            </p>
            <Link 
              href="/dashboard"
              className="btn-primary px-8 py-3 rounded-lg inline-block no-underline hover:scale-105 transition-transform"
            >
              Create Burner
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
