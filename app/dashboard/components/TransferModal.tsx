import { useState } from 'react'
import { Address } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { transferUSDC } from '../hooks/useTransferToken'
import { Wallet } from '../types/wallet'
import { ImSpinner8 } from 'react-icons/im'

type Props = {
  isOpen: boolean
  onClose: () => void
  wallet: Wallet
  balance: string
}

type TransferStep = 'input' | 'preparing' | 'confirming'

export function TransferModal({ isOpen, onClose, wallet, balance }: Props) {
  const [amount, setAmount] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<TransferStep>('input')

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
      await transferUSDC({
        from: wallet.address,
        to: toAddress as Address,
        amount,
        wallet,
        onStep: setCurrentStep
      })
      onClose()
    } catch (error) {
      console.error('Transfer failed:', error)
      setCurrentStep('input')
    } finally {
      setIsSubmitting(false)
    }
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

                <div className="mb-6">
                  <label className="block mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-2 rounded bg-box-primary border border-gray-600 focus:outline-none focus:border-primary"
                      placeholder="0.00"
                      max={balance}
                      step="0.01"
                      required
                    />
                    <span className="absolute right-3 top-2 text-gray-400">
                      USDC
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Balance: {balance} USDC
                  </div>
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
                    disabled={!amount || !toAddress || isSubmitting}
                    className="btn-primary px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
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