import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  isOpen: boolean
  onSubmit: (pin: string) => void
  onError: () => void
}

export function EnterPinModal({ isOpen, onSubmit, onError }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const storedPin = localStorage.getItem('burnerPin')
    if (pin === storedPin) {
      onSubmit(pin)
    } else {
      setError('Incorrect PIN')
      setPin('')
      onError()
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
              <h2 className="text-2xl font-bold mb-2">Welcome Back! 🔥</h2>
              <p className="text-gray-400 mb-8">Enter your PIN to access your burners</p>

              <div className="mb-8">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    setError('')
                    setPin(e.target.value)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="text-center text-2xl tracking-widest w-48 p-3 bg-box-primary rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                  placeholder="• • • • • •"
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="btn-primary px-8 py-3 rounded-lg text-lg w-full"
              >
                Unlock
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 