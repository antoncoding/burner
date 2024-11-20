import { useState, useMemo } from 'react';
import { Address, Chain } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { transferUSDC } from '../hooks/useTransferToken';
import { transferCrossChain } from '../hooks/useCrossChainTransfer';
import { TokenBalance, Wallet } from '../types/wallet';
import { ImSpinner8 } from 'react-icons/im';
import { base, optimism, arbitrum } from 'viem/chains';
import { SUPPORTED_STABLES } from '../config/tokens';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
  balances: TokenBalance[];
};

type TransferStep = 'input' | 'preparing' | 'confirming';

const SUPPORTED_CHAINS = [base, optimism, arbitrum];
const RELAYER_FEE = 0.1; // 0.1 USDC fee

export function TransferModal({ isOpen, onClose, wallet, balances }: Props) {
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<TransferStep>('input');
  const [isCrossChain, setIsCrossChain] = useState(false);

  const defaultSourceChain = useMemo(() => {
    if (balances.length === 0) return base;

    const chainBalances = balances.reduce(
      (acc, balance) => {
        const chainId = balance.chain.id;
        acc[chainId] = (acc[chainId] || 0) + parseFloat(balance.balance);
        return acc;
      },
      {} as Record<number, number>,
    );

    const [highestChainId] = Object.entries(chainBalances).sort(([, a], [, b]) => b - a)[0];

    return SUPPORTED_CHAINS.find((chain) => chain.id === Number(highestChainId)) || base;
  }, [balances]);

  const [sourceChain, setSourceChain] = useState<Chain>(defaultSourceChain);
  const [destinationChain, setDestinationChain] = useState<Chain>(base);

  const sourceChainBalance = useMemo(() => {
    return (
      balances.find((b) => b.token.symbol === 'USDC' && b.chain.id === sourceChain.id)?.balance ||
      '0'
    );
  }, [balances, sourceChain.id]);

  const steps = [
    { id: 'preparing', label: 'Preparing Transaction' },
    { id: 'confirming', label: 'Waiting for Confirmation' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !toAddress || isSubmitting) return;

    setIsSubmitting(true);
    setCurrentStep('preparing');

    try {
      if (isCrossChain) {
        await transferCrossChain({
          from: wallet.address,
          to: toAddress as Address,
          amount,
          wallet,
          sourceChainId: sourceChain.id,
          destinationChainId: destinationChain.id,
          onStep: setCurrentStep,
        });
      } else {
        await transferUSDC({
          from: wallet.address,
          to: toAddress as Address,
          amount,
          wallet,
          chainId: sourceChain.id,
          onStep: setCurrentStep,
        });
      }
      onClose();
    } catch (error) {
      console.error('Transfer failed:', error);
      setCurrentStep('input');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOutputAmount = () => {
    if (!amount || !isCrossChain) return amount;
    return (parseFloat(amount) - RELAYER_FEE).toFixed(6);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-box-secondary w-full max-w-md rounded-lg p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h2 className="mb-4 text-xl font-bold">Transfer USDC</h2>

            {currentStep === 'input' ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-2 block">To Address</label>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="bg-box-primary w-full rounded border border-gray-600 p-2 focus:border-primary focus:outline-none"
                    placeholder="0x..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-box-primary w-full rounded border border-gray-600 p-2 focus:border-primary focus:outline-none"
                      placeholder="0.00"
                      max={sourceChainBalance}
                      step="0.01"
                      required
                    />
                    <span className="absolute right-3 top-2 text-gray-400">USDC</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    Balance: {sourceChainBalance} USDC
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isCrossChain}
                      onChange={(e) => setIsCrossChain(e.target.checked)}
                      className="rounded border-gray-600"
                    />
                    <span>Cross-chain transfer</span>
                  </label>

                  <AnimatePresence mode="sync">
                    {isCrossChain && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="mb-2 block">Source Chain</label>
                            <div className="flex gap-2">
                              {SUPPORTED_CHAINS.map((chain) => (
                                <motion.button
                                  key={chain.id}
                                  type="button"
                                  onClick={() => setSourceChain(chain)}
                                  className={`rounded-lg border p-2 ${
                                    sourceChain.id === chain.id
                                      ? 'border-primary bg-primary/10'
                                      : 'border-gray-600 hover:border-primary/50'
                                  }`}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {chain.name}
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block">Destination Chain</label>
                            <div className="flex gap-2">
                              {SUPPORTED_CHAINS.filter((chain) => chain.id !== sourceChain.id).map(
                                (chain) => (
                                  <motion.button
                                    key={chain.id}
                                    type="button"
                                    onClick={() => setDestinationChain(chain)}
                                    className={`rounded-lg border p-2 ${
                                      destinationChain.id === chain.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-600 hover:border-primary/50'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {chain.name}
                                  </motion.button>
                                ),
                              )}
                            </div>
                          </div>

                          <motion.div
                            className="bg-box-primary/50 rounded-lg border border-gray-600/50 p-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Bridge Fee</span>
                              <span>0.1 USDC</span>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="hover:bg-box-hovered rounded px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !amount ||
                      !toAddress ||
                      isSubmitting ||
                      (isCrossChain && parseFloat(getOutputAmount()) <= 0)
                    }
                    className="btn-primary rounded px-4 py-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : isCrossChain ? 'Bridge' : 'Send'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8">
                <div className="flex flex-col items-center gap-6">
                  <ImSpinner8 className="h-10 w-10 animate-spin text-primary" />
                  <div className="w-full space-y-4">
                    {steps.map((step, index) => {
                      const isActive = step.id === currentStep;
                      const isPast = steps.findIndex((s) => s.id === currentStep) > index;
                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : isPast
                              ? 'text-green-500'
                              : 'text-gray-400'
                          }`}
                        >
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                              isActive
                                ? 'border-primary'
                                : isPast
                                ? 'border-green-500'
                                : 'border-gray-400'
                            }`}
                          >
                            {isPast ? '✓' : index + 1}
                          </div>
                          {step.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
