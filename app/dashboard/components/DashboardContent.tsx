'use client';

import { useState, useEffect } from 'react';
import { useWallets } from '../hooks/useWallets';
import { WalletCard } from './WalletCard';
import { CreateWalletModal } from './CreateWalletModal';
import { CreationSuccessModal } from './CreationSuccessModal';
import { SetPinModal } from './SetPinModal';
import { EnterPinModal } from './EnterPinModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CreateWalletFormData } from '../types/wallet';
import { motion, AnimatePresence } from 'framer-motion';
import { Address } from 'viem';
import { useTheme } from 'next-themes';
import { FaRegMoon, FaSun } from 'react-icons/fa';
import { IoRefreshOutline } from 'react-icons/io5';
import { Toaster } from 'react-hot-toast';
import { FiUnlock } from 'react-icons/fi';
import { fetchAllHistory } from '../hooks/useTokenHistory';

export default function DashboardContent() {
  const { wallets, isLoading, createWallet, updateLabel, burnWallet } = useWallets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ address: Address; label: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsPin, setNeedsPin] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBurnModeUnlocked, setIsBurnModeUnlocked] = useState(false);

  useEffect(() => {
    const hasPin = !!localStorage.getItem('burnerPin');
    setNeedsPin(!hasPin);
    setIsAuthenticated(false);
  }, []);

  const handleSetPin = (pin: string) => {
    localStorage.setItem('burnerPin', pin);
    setNeedsPin(false);
    setIsAuthenticated(true);
  };

  const handleEnterPin = (pin: string) => {
    setIsAuthenticated(true);
  };

  const handleCreateWallet = async (data: CreateWalletFormData) => {
    try {
      const address = await createWallet(data);
      setIsCreateModalOpen(false);
      setSuccessData({ address, label: data.label });
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Fetch both balances and history
    await Promise.all([
      fetchAllHistory(wallets.map((w) => w.address)),
      fetchAllHistory(wallets.map((w) => w.address)),
    ]);

    // Wait a bit to show the animation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  if (!isAuthenticated) {
    return needsPin ? (
      <SetPinModal isOpen={true} onSubmit={handleSetPin} />
    ) : (
      <EnterPinModal
        isOpen={true}
        onSubmit={handleEnterPin}
        onError={() => {
          /* TODO: Handle error */
        }}
      />
    );
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-background-secondary)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-background-hovered)',
          },
        }}
      />

      <motion.main
        className="container relative mx-auto max-w-2xl px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-3xl font-bold">Your Burners</h1>
          <p className="text-gray-400">Create and manage your burner wallets</p>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.address}
                wallet={wallet}
                onUpdateLabel={updateLabel}
                onBurnWallet={burnWallet}
                canShowBurnButton={isBurnModeUnlocked}
              />
            ))}
          </AnimatePresence>

          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-box-secondary hover:bg-box-secondary/90 flex w-full items-center justify-center gap-2 rounded-lg p-8 transition-all duration-200"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create New Burner</span>
          </motion.button>
        </div>

        <div className="fixed bottom-8 left-8 flex flex-col gap-3 md:left-12">
          <motion.button
            className="bg-box-secondary hover:bg-box-hovered rounded-full p-3 shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
          >
            <IoRefreshOutline
              className={`h-4 w-4 transition-transform duration-1000 ${
                isRefreshing ? 'rotate-360' : ''
              }`}
            />
          </motion.button>

          <motion.button
            className={`rounded-full p-3 shadow-lg transition-colors ${
              isBurnModeUnlocked
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-box-secondary hover:bg-box-hovered'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBurnModeUnlocked(!isBurnModeUnlocked)}
            title={isBurnModeUnlocked ? 'Lock burn mode' : 'Unlock burn mode'}
          >
            <FiUnlock className="h-4 w-4" />
          </motion.button>

          <motion.button
            className="bg-box-secondary hover:bg-box-hovered rounded-full p-3 shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <FaSun className="h-4 w-4" /> : <FaRegMoon className="h-4 w-4" />}
          </motion.button>
        </div>

        <CreateWalletModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateWallet}
        />

        <CreationSuccessModal
          isOpen={!!successData}
          onClose={() => setSuccessData(null)}
          address={successData?.address || '0x'}
          label={successData?.label || ''}
        />
      </motion.main>
    </>
  );
}
