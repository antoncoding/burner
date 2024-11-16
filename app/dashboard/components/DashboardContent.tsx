'use client';

import { useState } from 'react';
import { useWallets } from '../hooks/useWallets';
import { WalletCard } from './WalletCard';
import { CreateWalletModal } from './CreateWalletModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CreateWalletFormData } from '../types/wallet';

export default function DashboardContent() {
  const { wallets, isLoading, updateLabel } = useWallets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateWallet = async (data: CreateWalletFormData) => {
    // TODO: Implement wallet creation with ZeroDev SDK
    console.log('Creating wallet with:', data);
  };

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      {wallets.length === 0 ? (
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to Burner</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Create temporary wallets to receive funds without linking to your existing 
            on-chain identity. Perfect for one-time transactions or testing.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.address}
            wallet={wallet}
            onUpdateLabel={updateLabel}
          />
        ))}
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-box-secondary w-full rounded-lg p-8 flex items-center justify-center gap-2 hover:bg-box-secondary/90 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create New Burner</span>
        </button>
      </div>

      <CreateWalletModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWallet}
      />
    </main>
  );
}
