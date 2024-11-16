import { useState, useMemo } from 'react'
import { Address, Chain } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { transferUSDC } from '../hooks/useTransferToken'
import { transferCrossChain } from '../hooks/useCrossChainTransfer'
import { TokenBalance, Wallet } from '../types/wallet'
import { ImSpinner8 } from 'react-icons/im'
import { base, optimism, arbitrum } from 'viem/chains'
import { SUPPORTED_STABLES } from '../config/tokens'

type Props = {
  isOpen: boolean
  onClose: () => void
  wallet: Wallet
  balances: TokenBalance[]
}

type TransferStep = 'input' | 'preparing' | 'confirming'

const SUPPORTED_CHAINS = [base, optimism, arbitrum]
const RELAYER_FEE = 0.1 // 0.1 USDC fee

export function TransferModal({ isOpen, onClose, wallet, balances }: Props) {
  const [amount, setAmount] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<TransferStep>('input')
  const [isCrossChain, setIsCrossChain] = useState(false)

  const defaultSourceChain = useMemo(() => {
    if (balances.length === 0) return base

    const chainBalances = balances.reduce((acc, balance) => {
      const chainId = balance.chain.id
      acc[chainId] = (acc[chainId] || 0) + parseFloat(balance.balance)
      return acc
    }, {} as Record<number, number>)

    const [highestChainId] = Object.entries(chainBalances)
      .sort(([, a], [, b]) => b - a)[0]

    return SUPPORTED_CHAINS.find(chain => chain.id === Number(highestChainId)) || base
  }, [balances])

  const [sourceChain, setSourceChain] = useState<Chain>(defaultSourceChain)
  const [destinationChain, setDestinationChain] = useState<Chain>(base)

  const sourceChainBalance = useMemo(() => {
    return balances.find(b => 
      b.token.symbol === 'USDC' && b.chain.id === sourceChain.id
    )?.balance || '0'
  }, [balances, sourceChain.id])

  const steps = [
    { id: 'preparing', label: 'Preparing Transaction' },
    { id: 'confirming', label: 'Waiting for Confirmation' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !toAddress || isSubmitting) return

    setIsSubmitting(true)
    setCurrentStep('preparing')

    try {
      if (isCrossChain) {
        await transferCrossChain({
          from: wallet.address,
          to: toAddress as Address,
          amount,
          wallet,
          sourceChainId: sourceChain.id,
          destinationChainId: destinationChain.id,
          onStep: setCurrentStep
        })
      } else {
        await transferUSDC({
          from: wallet.address,
          to: toAddress as Address,
          amount,
          wallet,
          chainId: sourceChain.id,
          onStep: setCurrentStep
        })
      }
      onClose()
    } catch (error) {
      console.error('Transfer failed:', error)
      setCurrentStep('input')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getOutputAmount = () => {
    if (!amount || !isCrossChain) return amount
    return (parseFloat(amount) - RELAYER_FEE).toFixed(6)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-box-secondary rounded-lg p-6 max-w-md w-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h2 className="text-xl font-bold mb-4">Transfer USDC</h2>

            {currentStep === 'input' ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2">To Address</label>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="w-full p-2 rounded bg-box-primary border border-gray-600 focus:outline-none focus:border-primary"
                    placeholder="0x..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-2 rounded bg-box-primary border border-gray-600 focus:outline-none focus:border-primary"
                      placeholder="0.00"
                      max={sourceChainBalance}
                      step="0.01"
                      required
                    />
                    <span className="absolute right-3 top-2 text-gray-400">
                      USDC
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Balance: {sourceChainBalance} USDC
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCrossChain}
                      onChange={(e) => setIsCrossChain(e.target.checked)}
                      className="rounded border-gray-600"
                    />
                    <span>Cross-chain transfer</span>
                  </label>

                  {isCrossChain && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block mb-2">Source Chain</label>
                        <div className="flex gap-2">
                          {SUPPORTED_CHAINS.map((chain) => (
                            <button
                              key={chain.id}
                              type="button"
                              onClick={() => setSourceChain(chain)}
                              className={`p-2 rounded-lg border ${
                                sourceChain.id === chain.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-600 hover:border-primary/50'
                              }`}
                            >
                              {chain.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2">Destination Chain</label>
                        <div className="flex gap-2">
                          {SUPPORTED_CHAINS.filter(chain => chain.id !== sourceChain.id).map((chain) => (
                            <button
                              key={chain.id}
                              type="button"
                              onClick={() => setDestinationChain(chain)}
                              className={`p-2 rounded-lg border ${
                                destinationChain.id === chain.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-600 hover:border-primary/50'
                              }`}
                            >
                              {chain.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-box-primary/50 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Bridge Fee</span>
                          <span>0.1 USDC</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded hover:bg-box-hovered"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!amount || !toAddress || isSubmitting || (isCrossChain && parseFloat(getOutputAmount()) <= 0)}
                    className="btn-primary px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : isCrossChain ? 'Bridge' : 'Send'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8">
                <div className="flex flex-col items-center gap-6">
                  <ImSpinner8 className="w-10 h-10 animate-spin text-primary" />
                  <div className="space-y-4 w-full">
                    {steps.map((step, index) => {
                      const isActive = step.id === currentStep
                      const isPast = steps.findIndex(s => s.id === currentStep) > index
                      return (
                        <div 
                          key={step.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isActive ? 'bg-primary/10 text-primary' :
                            isPast ? 'text-green-500' : 'text-gray-400'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                            isActive ? 'border-primary' :
                            isPast ? 'border-green-500' : 'border-gray-400'
                          }`}>
                            {isPast ? '✓' : index + 1}
                          </div>
                          {step.label}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 