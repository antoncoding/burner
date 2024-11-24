import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Address } from 'viem';
import { Avatar } from './Avatar';
import { Wallet } from '../types/wallet';
import { PencilIcon } from '@heroicons/react/24/outline';
import { IoCopyOutline } from 'react-icons/io5';
import { FiCheck, FiExternalLink, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { TbFingerprint, TbKey } from 'react-icons/tb';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { base } from 'viem/chains';
import { TransferModal } from './TransferModal';
import { BurnWalletModal } from './BurnWalletModal';
import { useTokenHistory } from '../hooks/useTokenHistory';
import { formatDistanceToNow } from 'date-fns';
import { formatUnits } from 'viem';
import { SUPPORTED_STABLES } from '../config/tokens';
import { toast } from 'react-hot-toast';
import { RiFireLine } from 'react-icons/ri';

type Props = {
  wallet: Wallet;
  onUpdateLabel: (address: Address, newLabel: string) => void;
  onBurnWallet: (address: Address) => Promise<void>;
  canShowBurnButton?: boolean;
};

export function WalletCard({
  wallet,
  onUpdateLabel,
  onBurnWallet,
  canShowBurnButton = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(wallet.label);
  const [copied, setCopied] = useState(false);
  const { balances, isLoading, refetch: refetchBalances } = useTokenBalances(wallet.address);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const {
    history,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useTokenHistory(wallet.address);
  const [isExpanded, setIsExpanded] = useState(false);
  // const { requestNotificationPermission } = useNotifications(wallet.address);

  const refetchRef = useRef(refetchBalances);
  useEffect(() => {
    refetchRef.current = refetchBalances;
  }, [refetchBalances]);

  useEffect(() => {
    const handleBalancesRefresh = (event: CustomEvent<{ addresses: Address[] }>) => {
      if (event.detail.addresses.includes(wallet.address)) {
        refetchBalances();
      }
    };

    window.addEventListener('refreshBalances', handleBalancesRefresh as EventListener);
    return () =>
      window.removeEventListener('refreshBalances', handleBalancesRefresh as EventListener);
  }, [wallet.address, refetchBalances]);

  useEffect(() => {
    const handleHistoryRefresh = (event: CustomEvent<{ addresses: Address[] }>) => {
      if (event.detail.addresses.includes(wallet.address)) {
        refetchHistory();
      }
    };

    window.addEventListener('refreshHistory', handleHistoryRefresh as EventListener);
    return () =>
      window.removeEventListener('refreshHistory', handleHistoryRefresh as EventListener);
  }, [wallet.address, refetchHistory]);

  const handleLabelSubmit = () => {
    onUpdateLabel(wallet.address, label);
    setIsEditing(false);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEtherscanUrl = () => {
    const baseUrl = `https://basescan.org/address/${wallet.address}`;
    return baseUrl;
  };

  const canBurnWallet = !isLoading && balances.every((b) => parseFloat(b.balance) === 0);

  console.log('balances', balances);

  const totalBalance = balances
    .reduce((sum, balance) => sum + parseFloat(balance.balance), 0)
    .toFixed(2);

  const storedWallet = JSON.parse(localStorage.getItem('storedWallets') || '[]').find(
    (w: any) => w.address === wallet.address,
  );

  const displayName =
    storedWallet?.ens || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

  const handleBurnClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);

    setTimeout(() => {
      setIsBurnModalOpen(true);
    }, 150);
  };

  return (
    <motion.div
      className="bg-box-secondary w-full overflow-hidden rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div
        className="hover:bg-box-secondary/90 cursor-pointer p-8 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="group relative">
              <Avatar address={wallet.address} />
              <div className="bg-box-secondary absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full">
                {wallet.type === 'passkey' ? (
                  <TbFingerprint className="h-3 w-3 text-blue-500" />
                ) : (
                  <TbKey className="h-3 w-3 text-purple-500" />
                )}
              </div>
              <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {wallet.type === 'passkey'
                  ? '🔐 Passkey Controlled Burner'
                  : '🔑 Local Key Controlled Burner'}
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
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
                    className="border-b border-gray-600 bg-transparent focus:border-primary focus:outline-none"
                    onBlur={handleLabelSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleLabelSubmit()}
                    autoFocus
                  />
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{wallet.label}</span>
                  {wallet.type === 'localEOA' && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="hover:bg-box-primary rounded-full p-1 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
              <div
                className="cursor-pointer font-mono text-sm text-gray-400 transition-colors hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(storedWallet?.ens || wallet.address);
                  toast.success('Address copied!');
                }}
              >
                {displayName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length === 0 && !isLoadingHistory && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                New
              </span>
            )}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                window.open(getEtherscanUrl(), '_blank');
              }}
              className="hover:bg-box-primary rounded-lg p-2 transition-colors"
              title="View on Etherscan"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiExternalLink className="h-5 w-5" />
            </motion.button>

            <motion.button
              onClick={handleCopy}
              className="hover:bg-box-primary rounded-lg p-2 transition-colors"
              title="Copy address"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <FiCheck className="h-5 w-5 text-green-500" />
              ) : (
                <IoCopyOutline className="h-5 w-5" />
              )}
            </motion.button>

            {canShowBurnButton && (
              <motion.button
                className={`rounded-lg p-2 transition-colors ${
                  canBurnWallet
                    ? 'text-red-500 hover:bg-red-500/10'
                    : 'cursor-not-allowed text-gray-400'
                }`}
                disabled={!canBurnWallet}
                whileHover={canBurnWallet ? { scale: 1.05 } : undefined}
                whileTap={canBurnWallet ? { scale: 0.95 } : undefined}
                onClick={handleBurnClick}
                title={canBurnWallet ? 'Burn wallet' : 'Cannot burn wallet with balance'}
              >
                <RiFireLine className="h-5 w-5" />
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
                  key={`${balance.token.symbol}-${balance.chain}`}
                  className="group relative h-6 w-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Image
                    src={balance.token.icon}
                    alt={balance.token.symbol}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {balance.balance} {balance.token.symbol}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              className="btn-primary rounded-lg px-6 py-2 text-sm transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsTransferModalOpen(true)}
            >
              Transfer
            </motion.button>
          </div>
        </div>

        <motion.div
          className="mt-4 flex justify-center"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="h-5 w-5 text-gray-400" />
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
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                {history.length > 0 && (
                  <span className="text-sm text-gray-400">
                    {history.length} transaction{history.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {isLoadingHistory ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : history.length === 0 ? (
                <div className="bg-box-primary rounded-lg py-8 text-center">
                  <p className="text-gray-400">No transactions yet</p>
                  <p className="mt-1 text-sm text-gray-400">
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
                      <div className="flex items-start justify-between">
                        <div>
                          {item.details.tokenActions.map((action, index) => {
                            const token = SUPPORTED_STABLES.find((t) =>
                              t.networks.some(
                                (n) => n.address.toLowerCase() === action.address.toLowerCase(),
                              ),
                            );
                            if (!token) return null;

                            return (
                              <div key={index} className="flex items-center gap-2">
                                <Image src={token.icon} alt={token.symbol} width={20} height={20} />
                                <span
                                  className={
                                    action.direction === 'In' ? 'text-green-500' : 'text-red-500'
                                  }
                                >
                                  {action.direction === 'In' ? '+' : '-'}
                                  {formatUnits(BigInt(action.amount), token.decimals)}{' '}
                                  {token.symbol}
                                </span>
                              </div>
                            );
                          })}
                          <div className="mt-1 text-sm text-gray-400">
                            {formatDistanceToNow(item.timeMs, { addSuffix: true })}
                          </div>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://basescan.org/tx/${item.details.txHash}`, '_blank');
                          }}
                          className="hover:bg-box-secondary rounded-lg p-2 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiExternalLink className="h-4 w-4" />
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
        balances={balances}
      />

      <AnimatePresence>
        {isBurnModalOpen && (
          <BurnWalletModal
            isOpen={isBurnModalOpen}
            onClose={() => setIsBurnModalOpen(false)}
            onConfirm={async () => {
              await onBurnWallet(wallet.address);
              setIsBurnModalOpen(false);
            }}
            walletLabel={wallet.label}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
