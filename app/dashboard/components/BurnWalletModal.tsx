import { useState } from 'react'
import { Address } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2 } from 'react-icons/fi'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  walletLabel: string
}

export function BurnWalletModal({ isOpen, onClose, onConfirm, walletLabel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Failed to burn wallet:', error)
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
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4"
              >
                <FiTrash2 className="w-8 h-8 text-red-500" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">Burn Wallet</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to permanently remove "{walletLabel}"? This action cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded hover:bg-box-hovered transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleConfirm}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors hover:bg-red-600"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Burning...' : 'Yes, Burn It'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 