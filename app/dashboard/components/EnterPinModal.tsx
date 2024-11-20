import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  isOpen: boolean;
  onSubmit: (pin: string) => void;
  onError: () => void;
};

export function EnterPinModal({ isOpen, onSubmit, onError }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const PIN_LENGTH = 6;
  const slots = Array(PIN_LENGTH).fill(0);

  const handlePinInput = (value: string) => {
    const newPin = value.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    setError('');
    setPin(newPin);
  };

  const verifyPin = () => {
    const storedPin = localStorage.getItem('burnerPin');
    if (pin === storedPin) {
      onSubmit(pin);
    } else {
      setError('Incorrect PIN');
      setPin('');
      onError();
    }
  };

  // Auto-verify when PIN is complete
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      verifyPin();
    }
  }, [pin]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length > 0) {
      verifyPin();
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
            className="bg-box-secondary w-full max-w-md rounded-lg p-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">Welcome Back! 🔥</h2>
              <p className="mb-8 text-gray-400">Enter your PIN to access your burners</p>

              <div className="mb-8">
                <div className="relative">
                  <input
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => handlePinInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
                    autoFocus
                  />

                  <div className="flex justify-center gap-3">
                    {slots.map((_, index) => {
                      const isFilled = index < pin.length;
                      const isActive = index === pin.length;

                      return (
                        <motion.div
                          key={index}
                          className={`flex h-12 w-10 items-center justify-center rounded-lg border text-xl font-bold ${
                            isActive
                              ? 'border-2 border-primary'
                              : isFilled
                              ? 'bg-box-primary border-2 border-gray-500'
                              : 'border border-gray-600/50'
                          }`}
                          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          {isFilled ? '•' : ''}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <motion.p
                    className="mt-4 text-sm text-red-500"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <button
                onClick={verifyPin}
                disabled={pin.length === 0}
                className="btn-primary w-full rounded-lg px-8 py-3 text-lg disabled:opacity-50"
              >
                Unlock
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
