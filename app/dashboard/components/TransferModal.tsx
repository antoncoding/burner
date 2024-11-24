import { useState, useMemo } from 'react';
import { Address, Chain } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { transferUSDC } from '../hooks/useTransferToken';
import { useCrossChainTransfer } from '../hooks/useCrossChainTransfer';
import { TokenBalance, Wallet } from '../types/wallet';
import { ImSpinner8 } from 'react-icons/im';
import { base, optimism, arbitrum } from 'viem/chains';
import { SUPPORTED_STABLES } from '../config/tokens';
import { Select, SelectItem } from '@nextui-org/select';
import Image from 'next/image';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
  balances: TokenBalance[];
};

type TransferStep = 'input' | 'preparing' | 'confirming';

const SUPPORTED_CHAINS = [base, optimism, arbitrum];

export default function TransferModal({ isOpen, onClose, wallet, balances }: Props) {
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<TransferStep>('input');
  const [isCrossChain, setIsCrossChain] = useState(false);
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_STABLES[0]);

  const { transfer: transferCrossChain } = useCrossChainTransfer(wallet.address);

  const defaultSourceChain = useMemo(() => {
    if (balances.length === 0) return base;

    const chainBalances = balances.reduce(
      (acc, balance) => {
        const chainId = balance.chain;
        acc[chainId] = (acc[chainId] || 0) + parseFloat(balance.balance);
        return acc;
      },
      {} as Record<number, number>,
    );

    const maxChainId = Object.entries(chainBalances).reduce(
      (max, [chainId, balance]) => (balance > chainBalances[max] ? Number(chainId) : max),
      Number(Object.keys(chainBalances)[0]),
    );

    return SUPPORTED_CHAINS.find((chain) => chain.id === maxChainId) || base;
  }, [balances]);

  const [sourceChain, setSourceChain] = useState<Chain>(defaultSourceChain);
  const [destinationChain, setDestinationChain] = useState<Chain>(base);

  const sourceChainBalance = useMemo(() => {
    return (
      balances.find(
        (b) => b.token.symbol === selectedToken.symbol && b.chain === sourceChain.id,
      )?.balance || '0'
    );
  }, [balances, sourceChain.id, selectedToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !toAddress || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isCrossChain) {
        await transferCrossChain(
          sourceChain.id,
          destinationChain.id,
          amount,
          selectedToken,
          wallet.address as Address,
          toAddress as Address,
        );
      } else {
        await transferUSDC({
          from: wallet.address as Address,
          to: toAddress as Address,
          amount,
          wallet,
          onStep: setCurrentStep,
        });
      }

      onClose();
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsSubmitting(false);
      setCurrentStep('input');
    }
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
            <h2 className="mb-4 text-xl font-bold">Transfer {selectedToken.symbol}</h2>

            {currentStep === 'input' ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-2 block">To Address</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-600 bg-transparent p-2"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-600 bg-transparent p-2 pr-32"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      max={sourceChainBalance}
                      step="0.01"
                      required
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Select
                        defaultSelectedKeys={[SUPPORTED_STABLES[0].symbol]}
                        selectedKeys={[selectedToken.symbol]}
                        classNames={{
                          trigger: "min-h-0 h-8 bg-transparent border-0 min-w-[120px]",
                          value: "text-default-600",
                          popover: "min-w-[200px]"
                        }}
                        onChange={(e) => {
                          const token = SUPPORTED_STABLES.find((t) => t.symbol === e.target.value);
                          if (token) setSelectedToken(token);
                        }}
                        renderValue={(items) => {
                          const token = SUPPORTED_STABLES.find(t => t.symbol === items[0]?.key);
                          return token ? (
                            <div className="flex items-center gap-2">
                              <Image src={token.icon} alt={token.symbol} width={16} height={16} />
                              <span>{token.symbol}</span>
                            </div>
                          ) : null;
                        }}
                      >
                        {SUPPORTED_STABLES.map((token) => (
                          <SelectItem 
                            key={token.symbol} 
                            value={token.symbol}
                            className="data-[selected=true]:bg-default-100"
                          >
                            <div className="flex items-center gap-2">
                              <Image src={token.icon} alt={token.symbol} width={16} height={16} />
                              <span>{token.symbol}</span>
                              <span className="ml-auto rounded bg-default-100 px-1.5 py-0.5 text-xs">
                                {sourceChain.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    Balance: {sourceChainBalance} {selectedToken.symbol}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-600"
                      checked={isCrossChain}
                      onChange={(e) => setIsCrossChain(e.target.checked)}
                    />
                    <span>Cross-chain Transfer</span>
                  </label>

                  {isCrossChain && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Select
                            label="From Chain"
                            selectedKeys={[sourceChain.id.toString()]}
                            onChange={(e) => {
                              const chain = SUPPORTED_CHAINS.find(
                                (c) => c.id.toString() === e.target.value,
                              );
                              if (chain) setSourceChain(chain);
                            }}
                          >
                            {SUPPORTED_CHAINS.map((chain) => (
                              <SelectItem key={chain.id} value={chain.id}>
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={`/chains/${chain.id}.png`}
                                    alt={chain.name}
                                    width={20}
                                    height={20}
                                  />
                                  {chain.name}
                                </div>
                              </SelectItem>
                            ))}
                          </Select>
                        </div>

                        <div className="flex-1">
                          <Select
                            label="To Chain"
                            selectedKeys={[destinationChain.id.toString()]}
                            onChange={(e) => {
                              const chain = SUPPORTED_CHAINS.find(
                                (c) => c.id.toString() === e.target.value,
                              );
                              if (chain) setDestinationChain(chain);
                            }}
                          >
                            {SUPPORTED_CHAINS.map((chain) => (
                              <SelectItem key={chain.id} value={chain.id}>
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={`/chains/${chain.id}.png`}
                                    alt={chain.name}
                                    width={20}
                                    height={20}
                                  />
                                  {chain.name}
                                </div>
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="mt-4"
                      >
                        <Select
                          label="Token"
                          selectedKeys={[selectedToken.symbol]}
                          onChange={(e) => {
                            const token = SUPPORTED_STABLES.find((t) => t.symbol === e.target.value);
                            if (token) setSelectedToken(token);
                          }}
                        >
                          {SUPPORTED_STABLES.map((token) => (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              <div className="flex items-center gap-2">
                                <Image src={token.icon} alt={token.symbol} width={20} height={20} />
                                {token.symbol}
                              </div>
                            </SelectItem>
                          ))}
                        </Select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 rounded-lg border border-gray-600 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Bridge Fee</span>
                          <span>0.1 {selectedToken.symbol}</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 text-gray-400 hover:text-white"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ImSpinner8 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Transfer'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <ImSpinner8 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <div className="font-bold">Preparing Transaction</div>
                  <div className="text-sm text-gray-400">Please wait...</div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
