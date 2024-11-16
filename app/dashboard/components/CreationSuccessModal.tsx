import { useState } from 'react'
import { Address } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCopyOutline } from 'react-icons/io5'
import { FiCheck } from 'react-icons/fi'

type Props = {
  isOpen: boolean
  onClose: () => void
  address: Address
  label: string
}

export function CreationSuccessModal({ isOpen, onClose, address, label }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-2">Burner Created!</h2>
              <p className="text-gray-400 mb-6">
                Your new burner wallet "{label}" is ready to use
              </p>

              <div className="bg-box-primary rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm">{address.slice(0, 8)}...{address.slice(-8)}</code>
                  <motion.button
                    onClick={handleCopy}
                    className="p-2 hover:bg-box-secondary rounded-lg transition-colors"
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

              <button
                onClick={onClose}
                className="btn-primary px-8 py-3 rounded-lg w-full"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 