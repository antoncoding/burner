import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Address, Chain } from 'viem'
import { Avatar } from './Avatar'
import { Wallet } from '../types/wallet'
import { PencilIcon } from '@heroicons/react/24/outline'
import { IoCopyOutline } from 'react-icons/io5'
import { FiCheck, FiExternalLink } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { TbFingerprint, TbKey } from 'react-icons/tb'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { base } from 'viem/chains'

type Props = {
  wallet: Wallet
  onUpdateLabel: (address: Address, newLabel: string) => void
}

export function WalletCard({ wallet, onUpdateLabel }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(wallet.label)
  const [copied, setCopied] = useState(false)
  const { balances, refetch } = useTokenBalances(wallet.address)

  const refetchRef = useRef(refetch)
  useEffect(() => {
    refetchRef.current = refetch
  }, [refetch])

  useEffect(() => {
    const handleRefresh = () => refetchRef.current()
    window.addEventListener('refreshBalances', handleRefresh)
    return () => window.removeEventListener('refreshBalances', handleRefresh)
  }, [])

  const handleLabelSubmit = () => {
    onUpdateLabel(wallet.address, label)
    setIsEditing(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getEtherscanUrl = () => {
    const baseUrl = `https://basescan.org/address/${wallet.address}`
    return baseUrl
  }

  const totalBalance = balances.reduce(
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
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar address={wallet.address} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-box-secondary flex items-center justify-center">
              {wallet.type === 'passkey' 
                ? <TbFingerprint className="w-3 h-3 text-blue-500" />
                : <TbKey className="w-3 h-3 text-purple-500" />
              }
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
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
                <span className="font-medium text-lg">{wallet.label}</span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-box-primary rounded-full transition-colors"
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="text-sm text-gray-400 font-mono">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => window.open(getEtherscanUrl(), '_blank')}
            className="p-2 hover:bg-box-primary rounded-lg transition-colors"
            title="View on Etherscan"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiExternalLink className="w-5 h-5" />
          </motion.button>

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
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-300">
            ${totalBalance}
          </span>
          <span className="text-sm text-gray-400">Total Balance</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {balances.map((balance) => (
              <motion.div 
                key={`${balance.token.symbol}-${balance.chain.id}`}
                className="relative w-6 h-6 group"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image
                  src={balance.token.icon}
                  alt={balance.token.symbol}
                  fill
                  className="object-contain"
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {balance.balance} {balance.token.symbol}
                </div>
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