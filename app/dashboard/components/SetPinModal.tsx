import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  isOpen: boolean;
  onSubmit: (pin: string) => void;
};

export function SetPinModal({ isOpen, onSubmit }: Props) {
  const [step, setStep] = useState<'intro' | 'set' | 'confirm'>('intro');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  // Create array of 6 slots
  const PIN_LENGTH = 6;
  const slots = Array(PIN_LENGTH).fill(0);

  const handlePinInput = (value: string, isConfirm = false) => {
    const newPin = value.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    setError('');

    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
  };

  const handlePinSubmit = () => {
    if (step === 'set') {
      if (pin.length < PIN_LENGTH) {
        setError(`PIN must be ${PIN_LENGTH} digits`);
        return;
      }
      setStep('confirm');
      setConfirmPin('');
    } else if (step === 'confirm') {
      if (pin !== confirmPin) {
        setError('PINs do not match');
        setConfirmPin('');
        return;
      }
      onSubmit(pin);
    }
  };

  const content = {
    intro: {
      title: 'Welcome to Burner! 🔥',
      description:
        "Create temporary wallets without revealing your identity. First, let's set up a PIN to protect your burners.",
      action: "Let's Go",
    },
    set: {
      title: 'Set Your PIN',
      description: `Choose a ${PIN_LENGTH}-digit PIN. Make it memorable but secure!`,
      action: 'Continue',
    },
    confirm: {
      title: 'Confirm Your PIN',
      description: 'Enter your PIN again to confirm',
      action: 'Complete Setup',
    },
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
              <h2 className="mb-2 text-2xl font-bold">{content[step].title}</h2>
              <p className="mb-8 text-gray-400">{content[step].description}</p>

              {step !== 'intro' && (
                <div className="mb-8">
                  {/* Make input cover the whole pin area */}
                  <div className="relative">
                    <input
                      type="number"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={step === 'set' ? pin : confirmPin}
                      onChange={(e) => handlePinInput(e.target.value, step === 'confirm')}
                      className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
                      autoFocus
                    />

                    {/* PIN slots visualization */}
                    <div className="flex justify-center gap-3">
                      {slots.map((_, index) => {
                        const currentPin = step === 'set' ? pin : confirmPin;
                        const isFilled = index < currentPin.length;
                        const isActive = index === currentPin.length;

                        return (
                          <motion.div
                            key={index}
                            className={`flex h-12 w-10 items-center justify-center rounded-lg border text-xl font-bold ${
                              isActive
                                ? 'border-1 border-primary'
                                : isFilled
                                ? 'bg-box-primary border-1 border-gray-500'
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
              )}

              <button
                onClick={() => (step === 'intro' ? setStep('set') : handlePinSubmit())}
                className="btn-primary w-full rounded-lg px-8 py-3 text-lg"
              >
                {content[step].action}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
