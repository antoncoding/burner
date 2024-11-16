import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Address, Chain } from 'viem'
import { Avatar } from './Avatar'
import { Wallet } from '../types/wallet'
import { PencilIcon } from '@heroicons/react/24/outline'
import { IoCopyOutline } from 'react-icons/io5'
import { FiCheck, FiExternalLink, FiTrash2, FiChevronDown } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { TbFingerprint, TbKey } from 'react-icons/tb'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { base } from 'viem/chains'
import { TransferModal } from './TransferModal'
import { BurnWalletModal } from './BurnWalletModal'
import { useTokenHistory } from '../hooks/useTokenHistory'
import { formatDistanceToNow } from 'date-fns'
import { formatUnits } from 'viem'
import { SUPPORTED_STABLES } from '../config/tokens'
import { useNotifications } from '../../hooks/useNotifications'
import { toast } from 'react-hot-toast'

type Props = {
  wallet: Wallet
  onUpdateLabel: (address: Address, newLabel: string) => void
  onBurnWallet: (address: Address) => Promise<void>
  canShowBurnButton?: boolean
}

export function WalletCard({ wallet, onUpdateLabel, onBurnWallet, canShowBurnButton = false }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(wallet.label)
  const [copied, setCopied] = useState(false)
  const { balances, isLoading, refetch: refetchBalances } = useTokenBalances(wallet.address)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false)
  const { history, isLoading: isLoadingHistory, refetch: refetchHistory } = useTokenHistory(wallet.address)
  const [isExpanded, setIsExpanded] = useState(false)
  const { requestNotificationPermission } = useNotifications(wallet.address)

  const refetchRef = useRef(refetchBalances)
  useEffect(() => {
    refetchRef.current = refetchBalances
  }, [refetchBalances])

  useEffect(() => {
    const handleBalancesRefresh = (event: CustomEvent<{ addresses: Address[] }>) => {
      if (event.detail.addresses.includes(wallet.address)) {
        refetchBalances()
      }
    }

    window.addEventListener('refreshBalances', handleBalancesRefresh as EventListener)
    return () => window.removeEventListener('refreshBalances', handleBalancesRefresh as EventListener)
  }, [wallet.address, refetchBalances])

  useEffect(() => {
    const handleHistoryRefresh = (event: CustomEvent<{ addresses: Address[] }>) => {
      if (event.detail.addresses.includes(wallet.address)) {
        refetchHistory()
      }
    }

    window.addEventListener('refreshHistory', handleHistoryRefresh as EventListener)
    return () => window.removeEventListener('refreshHistory', handleHistoryRefresh as EventListener)
  }, [wallet.address, refetchHistory])

  const handleLabelSubmit = () => {
    onUpdateLabel(wallet.address, label)
    setIsEditing(false)
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getEtherscanUrl = () => {
    const baseUrl = `https://basescan.org/address/${wallet.address}`
    return baseUrl
  }

  const canBurnWallet = !isLoading && balances.every(b => parseFloat(b.balance) === 0)

  const totalBalance = balances.reduce(
    (sum, balance) => sum + parseFloat(balance.balance),
    0
  ).toFixed(2)

  // Get USDC balance
  const usdcBalance = balances.find(b => 
    b.token.symbol === 'USDC' && b.chain.id === base.id
  )?.balance || '0'

  const storedWallet = JSON.parse(localStorage.getItem('storedWallets') || '[]')
    .find((w: any) => w.address === wallet.address)

  const displayName = storedWallet?.ens || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`

  const handleBurnClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(false)
    
    setTimeout(() => {
      setIsBurnModalOpen(true)
    }, 150)
  }

  return (
    <motion.div 
      className="bg-box-secondary w-full rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div 
        className="p-8 cursor-pointer hover:bg-box-secondary/90 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar address={wallet.address} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-box-secondary flex items-center justify-center">
                {wallet.type === 'passkey' 
                  ? <TbFingerprint className="w-3 h-3 text-blue-500" />
                  : <TbKey className="w-3 h-3 text-purple-500" />
                }
              </div>
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {wallet.type === 'passkey' 
                  ? '🔐 Passkey Controlled Burner'
                  : '🔑 Local Key Controlled Burner'
                }
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
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
                  {wallet.type === 'localEOA' && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:bg-box-primary rounded-full transition-colors"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-400 font-mono cursor-pointer hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(storedWallet?.ens || wallet.address)
                  toast.success('Address copied!')
                }}
              >
                {displayName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length === 0 && !isLoadingHistory && (
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                New
              </span>
            )}
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                window.open(getEtherscanUrl(), '_blank')
              }}
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

            {canShowBurnButton && (
              <motion.button
                className={`p-2 rounded-lg transition-colors ${
                  canBurnWallet
                    ? 'text-red-500 hover:bg-red-500/10'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                disabled={!canBurnWallet}
                whileHover={canBurnWallet ? { scale: 1.05 } : undefined}
                whileTap={canBurnWallet ? { scale: 0.95 } : undefined}
                onClick={handleBurnClick}
                title={canBurnWallet ? 'Burn wallet' : 'Cannot burn wallet with balance'}
              >
                <FiTrash2 className="w-5 h-5" />
              </motion.button>
            )}
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
              onClick={() => setIsTransferModalOpen(true)}
            >
              Transfer
            </motion.button>
          </div>
        </div>

        <motion.div 
          className="flex justify-center mt-4"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700/20"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                {history.length > 0 && (
                  <span className="text-sm text-gray-400">
                    {history.length} transaction{history.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 bg-box-primary rounded-lg">
                  <p className="text-gray-400">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <motion.div
                      key={item.details.txHash}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-box-primary rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          {item.details.tokenActions.map((action, index) => {
                            const token = SUPPORTED_STABLES.find(t => 
                              t.networks.some(n => n.address.toLowerCase() === action.address.toLowerCase())
                            )
                            if (!token) return null
                            
                            return (
                              <div key={index} className="flex items-center gap-2">
                                <Image
                                  src={token.icon}
                                  alt={token.symbol}
                                  width={20}
                                  height={20}
                                />
                                <span className={action.direction === 'In' ? 'text-green-500' : 'text-red-500'}>
                                  {action.direction === 'In' ? '+' : '-'} 
                                  {formatUnits(BigInt(action.amount), token.decimals)} {token.symbol}
                                </span>
                              </div>
                            )
                          })}
                          <div className="text-sm text-gray-400 mt-1">
                            {formatDistanceToNow(item.timeMs, { addSuffix: true })}
                          </div>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(
                              `https://basescan.org/tx/${item.details.txHash}`,
                              '_blank'
                            )
                          }}
                          className="p-2 hover:bg-box-secondary rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallet={wallet}
        balance={usdcBalance}
      />

      <AnimatePresence>
        {isBurnModalOpen && (
          <BurnWalletModal
            isOpen={isBurnModalOpen}
            onClose={() => setIsBurnModalOpen(false)}
            onConfirm={async () => {
              await onBurnWallet(wallet.address)
              setIsBurnModalOpen(false)
            }}
            walletLabel={wallet.label}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
} 