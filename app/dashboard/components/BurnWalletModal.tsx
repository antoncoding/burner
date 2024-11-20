import { useState } from 'react';
import { Address } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  walletLabel: string;
};

export function BurnWalletModal({ isOpen, onClose, onConfirm, walletLabel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Failed to burn wallet:', error);
    } finally {
      setIsSubmitting(false);
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
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10"
              >
                <FiTrash2 className="h-8 w-8 text-red-500" />
              </motion.div>

              <h2 className="mb-2 text-2xl font-bold">Burn Wallet</h2>
              <p className="mb-6 text-gray-400">
                Are you sure you want to permanently remove "{walletLabel}"? This action cannot be
                undone.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={onClose}
                  className="hover:bg-box-hovered flex-1 rounded px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleConfirm}
                  className="flex-1 rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
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
  );
}
