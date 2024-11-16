import { useState } from 'react'
import Image from 'next/image'
import { Address } from 'viem'
import { Avatar } from './Avatar'
import { Wallet } from '../types/wallet'
import { PencilIcon } from '@heroicons/react/24/outline'
import { IoCopyOutline } from 'react-icons/io5'
import { FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { TbFingerprint, TbKey } from 'react-icons/tb'

type Props = {
  wallet: Wallet
  onUpdateLabel: (address: Address, newLabel: string) => void
}

export function WalletCard({ wallet, onUpdateLabel }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(wallet.label)
  const [copied, setCopied] = useState(false)

  const handleLabelSubmit = () => {
    onUpdateLabel(wallet.address, label)
    setIsEditing(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalBalance = wallet.balances.reduce(
    (sum, balance) => sum + parseFloat(balance.balance),
    0
  ).toFixed(2)

  return (
    <motion.div 
      className="bg-box-secondary w-full rounded-lg p-8 hover:bg-box-secondary/90 transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <Avatar address={wallet.address} />
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <motion.div 
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-transparent border-b border-gray-600 focus:outline-none focus:border-primary"
                  onBlur={handleLabelSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleLabelSubmit()}
                  autoFocus
                />
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium">{wallet.label}</span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-box-primary rounded-full transition-colors"
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className={`flex items-center gap-1.5 text-xs py-1 px-2 rounded-full
              ${wallet.type === 'passkey' 
                ? 'bg-blue-500/10 text-blue-500' 
                : 'bg-purple-500/10 text-purple-500'
              }`}
          >
            {wallet.type === 'passkey' 
              ? <TbFingerprint className="w-3.5 h-3.5" />
              : <TbKey className="w-3.5 h-3.5" />
            }
            <span className="font-medium">
              {wallet.type === 'passkey' ? 'Passkey' : 'Local Key'}
            </span>
          </div>

          <motion.button
            onClick={handleCopy}
            className="p-2 hover:bg-box-primary rounded-lg transition-colors"
            title="Copy address"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <FiCheck className="w-5 h-5 text-green-500" />
            ) : (
              <IoCopyOutline className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-gray-800 dark:text-gray-300">
          ${totalBalance}
        </span>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {wallet.balances.map((balance) => (
              <motion.div 
                key={balance.symbol}
                className="relative w-6 h-6"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image
                  src={balance.icon}
                  alt={balance.symbol}
                  fill
                  className="object-contain"
                />
              </motion.div>
            ))}
          </div>

          <motion.button 
            className="btn-primary rounded-lg py-2 px-6 text-sm transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Transfer
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
} 