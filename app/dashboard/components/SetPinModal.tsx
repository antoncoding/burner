import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  isOpen: boolean
  onSubmit: (pin: string) => void
}

export function SetPinModal({ isOpen, onSubmit }: Props) {
  const [step, setStep] = useState<'intro' | 'set' | 'confirm'>('intro')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')

  const handlePinSubmit = () => {
    if (step === 'set') {
      if (pin.length < 6) {
        setError('PIN must be at least 6 digits')
        return
      }
      setStep('confirm')
    } else if (step === 'confirm') {
      if (pin !== confirmPin) {
        setError('PINs do not match')
        setConfirmPin('')
        return
      }
      onSubmit(pin)
    }
  }

  const content = {
    intro: {
      title: "Welcome to Burner! 🔥",
      description: "Create temporary wallets without revealing your identity. First, let's set up a PIN to protect your burners.",
      action: "Let's Go"
    },
    set: {
      title: "Set Your PIN",
      description: "Choose a PIN with at least 6 digits. Make it memorable but secure!",
      action: "Continue"
    },
    confirm: {
      title: "Confirm Your PIN",
      description: "Enter your PIN again to confirm",
      action: "Complete Setup"
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
            className="bg-box-secondary rounded-lg p-8 max-w-md w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{content[step].title}</h2>
              <p className="text-gray-400 mb-8">{content[step].description}</p>

              {step !== 'intro' && (
                <div className="mb-8">
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    value={step === 'set' ? pin : confirmPin}
                    onChange={(e) => {
                      setError('')
                      if (step === 'set') {
                        setPin(e.target.value)
                      } else {
                        setConfirmPin(e.target.value)
                      }
                    }}
                    className="text-center text-2xl tracking-widest w-48 p-3 bg-box-primary rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                    placeholder="• • • • • •"
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>
              )}

              <button
                onClick={() => step === 'intro' ? setStep('set') : handlePinSubmit()}
                className="btn-primary px-8 py-3 rounded-lg text-lg w-full"
              >
                {content[step].action}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 