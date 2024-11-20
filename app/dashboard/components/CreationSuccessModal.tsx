import { useState, useEffect } from 'react';
import { Address, slice } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCopyOutline } from 'react-icons/io5';
import { FiCheck } from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import { useWindowSize } from 'app/hooks/useWindowSize';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  address: Address;
  label: string;
};

export function CreationSuccessModal({ isOpen, onClose, address, label }: Props) {
  const [copied, setCopied] = useState(false);
  const [ensName, setEnsName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registeredENS, setRegisteredENS] = useState<string | null>(null);
  const { width } = useWindowSize();

  const formatAddress = (addr: string) => {
    if (width && width < 640) {
      // mobile view
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    // Only allow closing if not in the middle of registration
    if (!isRegistering) {
      onClose();
      // Reset states for next open
      setEnsName('');
      setRegistrationSuccess(false);
      setRegistrationError(null);
      setRegisteredENS(null);
    }
  };

  const handleRegisterENS = async () => {
    if (!ensName) return;
    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const response = await fetch('/api/ens/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: ensName,
          address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]');
      const updated = stored.map((w: any) =>
        w.address === address ? { ...w, ens: `${ensName}.burnerstation.eth` } : w,
      );
      localStorage.setItem('storedWallets', JSON.stringify(updated));

      setRegisteredENS(`${ensName}.burnerstation.eth`);
      setRegistrationSuccess(true);
      toast.success('✨ ENS name registered successfully!');
    } catch (error) {
      console.error('Failed to register ENS:', error);
      setRegistrationError(error instanceof Error ? error.message : 'Failed to register ENS');
      toast.error('😅 Failed to register ENS name');
    } finally {
      setIsRegistering(false);
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
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="mb-2 text-2xl font-bold">Burner Created!</h2>
              <p className="mb-6 text-gray-400">Your new burner wallet "{label}" is ready to use</p>

              <div className="bg-box-primary mb-8 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="font-mono text-sm">{`${slice(address, 0, 6)}...${slice(
                    address,
                    -4,
                  )}`}</code>
                  <motion.button
                    onClick={handleCopy}
                    className="hover:bg-box-secondary rounded-lg p-2 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? (
                      <FiCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <IoCopyOutline className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                  <label className="block text-left text-sm text-gray-400">
                    Set a custom ENS name (optional)
                  </label>
                  <div className="bg-box-primary rounded-full border border-gray-600/50 px-2 py-1 text-xs text-gray-400">
                    Free
                  </div>
                </div>
                <div className="bg-box-primary/50 flex items-center overflow-hidden rounded-lg border border-gray-600/50 focus-within:border-gray-500">
                  <div className="flex min-w-0 flex-1 items-center">
                    <input
                      type="text"
                      value={ensName}
                      onChange={(e) => {
                        setEnsName(e.target.value.toLowerCase());
                        setRegistrationError(null);
                      }}
                      className="w-full border-none bg-transparent p-2 text-gray-400 placeholder-gray-500 focus:outline-none"
                      placeholder="vitalik"
                      disabled={isRegistering || registrationSuccess}
                    />
                    <span className="whitespace-nowrap pr-3 text-gray-500">.burnerstation.eth</span>
                  </div>
                  <motion.button
                    onClick={handleRegisterENS}
                    disabled={!ensName || isRegistering || registrationSuccess}
                    className={`m-1 rounded-md px-4 py-2 transition-colors ${
                      isRegistering || registrationSuccess
                        ? 'opacity-50'
                        : 'bg-box-primary hover:bg-box-hovered text-gray-400'
                    }`}
                    whileHover={
                      !isRegistering && !registrationSuccess ? { scale: 1.02 } : undefined
                    }
                    whileTap={!isRegistering && !registrationSuccess ? { scale: 0.98 } : undefined}
                  >
                    {isRegistering ? (
                      <ImSpinner8 className="mx-auto h-5 w-5 animate-spin" />
                    ) : registrationSuccess ? (
                      <FiCheck className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                      'Register'
                    )}
                  </motion.button>
                </div>
                {registrationError && (
                  <p className="mt-2 text-sm text-red-500">{registrationError}</p>
                )}
              </div>

              <button
                onClick={handleClose}
                disabled={isRegistering}
                className={`btn-primary w-full rounded-lg px-8 py-3 ${
                  isRegistering ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
