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
import { fetchAllBalances } from '../hooks/useTokenBalances';
import { FiUnlock } from 'react-icons/fi'

export default function DashboardContent() {
  const { wallets, isLoading, createWallet, updateLabel, burnWallet } = useWallets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ address: Address; label: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsPin, setNeedsPin] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBurnModeUnlocked, setIsBurnModeUnlocked] = useState(false)

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
    const addresses = wallets.map(w => w.address);
    await fetchAllBalances(addresses);
    setIsRefreshing(false);
  };

  if (!isAuthenticated) {
    return needsPin ? (
      <SetPinModal isOpen={true} onSubmit={handleSetPin} />
    ) : (
      <EnterPinModal 
        isOpen={true} 
        onSubmit={handleEnterPin}
        onError={() => {/* TODO: Handle error */}}
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
        className="container max-w-2xl mx-auto px-4 py-8 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Your Burners</h1>
          <p className="text-gray-400">
            Create and manage your burner wallets
          </p>
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
            className="bg-box-secondary w-full rounded-lg p-8 flex items-center justify-center gap-2 hover:bg-box-secondary/90 transition-all duration-200"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create New Burner</span>
          </motion.button>
        </div>

        <div className="fixed bottom-8 left-8 md:left-12 flex flex-col gap-3">
          <motion.button
            className="p-3 rounded-full bg-box-secondary hover:bg-box-hovered transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
          >
            <IoRefreshOutline 
              className={`w-4 h-4 transition-transform duration-1000 ${
                isRefreshing ? 'rotate-360' : ''
              }`}
            />
          </motion.button>

          <motion.button
            className={`p-3 rounded-full transition-colors shadow-lg ${
              isBurnModeUnlocked 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-box-secondary hover:bg-box-hovered'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBurnModeUnlocked(!isBurnModeUnlocked)}
            title={isBurnModeUnlocked ? 'Lock burn mode' : 'Unlock burn mode'}
          >
            <FiUnlock className="w-4 h-4" />
          </motion.button>

          <motion.button
            className="p-3 rounded-full bg-box-secondary hover:bg-box-hovered transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <FaSun className="w-4 h-4" />
            ) : (
              <FaRegMoon className="w-4 h-4" />
            )}
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
