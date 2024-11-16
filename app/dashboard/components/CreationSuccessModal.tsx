import { useState } from 'react'
import { Address } from 'viem'
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

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
            className="bg-box-secondary rounded-lg p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">Burner Ready! 🔥</h2>
              <p className="text-gray-400 mb-6">
                Your burner wallet "{label}" has been created and is ready for action
              </p>

              <div className="w-full p-3 bg-box-primary rounded-lg flex items-center justify-between gap-2 mb-6">
                <span className="text-sm truncate">{address}</span>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-box-secondary rounded-lg transition-colors"
                >
                  {copied ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                onClick={onClose}
                className="btn-primary px-6 py-2 rounded-lg"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 