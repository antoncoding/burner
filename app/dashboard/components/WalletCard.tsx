import { useState } from 'react'
import Image from 'next/image'
import { Address } from 'viem'
import { Avatar } from './Avatar'
import { Wallet } from '../types/wallet'
import { PencilIcon } from '@heroicons/react/24/outline'

type Props = {
  wallet: Wallet
  onUpdateLabel: (address: Address, newLabel: string) => void
}

export function WalletCard({ wallet, onUpdateLabel }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(wallet.label)

  const handleLabelSubmit = () => {
    onUpdateLabel(wallet.address, label)
    setIsEditing(false)
  }

  // Calculate total balance
  const totalBalance = wallet.balances.reduce(
    (sum, balance) => sum + parseFloat(balance.balance),
    0
  ).toFixed(2)

  return (
    <div className="bg-box-secondary w-full rounded-lg p-8 mb-4 hover:bg-box-secondary/90 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Avatar address={wallet.address} />
          
          <div className="flex-1">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-transparent border-b border-gray-600 focus:outline-none"
                  onBlur={handleLabelSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleLabelSubmit()}
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium">{wallet.label}</span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-700 rounded-full"
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <button 
          className="btn-primary rounded-lg py-2 px-6 text-sm transition-colors self-end sm:self-center"
        >
          Transfer
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-3xl font-bold text-grey-800 dark:text-grey-300">
          ${totalBalance}
        </span>
        
        <div className="flex gap-2">
          {wallet.balances.map((balance) => (
            <div 
              key={balance.symbol}
              className="relative w-6 h-6"
            >
              <Image
                src={balance.icon}
                alt={balance.symbol}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 