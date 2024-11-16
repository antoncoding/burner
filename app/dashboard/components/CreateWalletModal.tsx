import { useState } from 'react'
import { SignerType, CreateWalletFormData } from '../types/wallet'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateWalletFormData) => Promise<void>
}

export function CreateWalletModal({ isOpen, onClose, onSubmit }: Props) {
  const [label, setLabel] = useState('')
  const [selectedSigner, setSelectedSigner] = useState<SignerType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSigner) return
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        label,
        signerType: selectedSigner
      })
      onClose()
    } catch (error) {
      console.error('Failed to create wallet:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-box-secondary rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create New Burner</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2">Burner Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full p-2 rounded bg-box-primary border border-gray-600 focus:outline-none focus:border-primary"
              placeholder="e.g., ETH Global Prize"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2">Choose Your Signer</label>
            <div className="space-y-3">
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedSigner === 'passkey' 
                    ? 'bg-primary/10 border-2 border-primary shadow-sm' 
                    : 'border border-gray-600 hover:border-primary/50'
                }`}
                onClick={() => setSelectedSigner('passkey')}
              >
                <div className="font-medium flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${selectedSigner === 'passkey' ? 'border-primary' : 'border-gray-600'}`}
                  >
                    {selectedSigner === 'passkey' && 
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    }
                  </div>
                  Passkey
                </div>
                <p className="text-sm text-gray-400 mt-1 ml-6">
                  Use your device's biometric authentication for secure signing
                </p>
              </div>

              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedSigner === 'localEOA' 
                    ? 'bg-primary/10 border-2 border-primary shadow-sm' 
                    : 'border border-gray-600 hover:border-primary/50'
                }`}
                onClick={() => setSelectedSigner('localEOA')}
              >
                <div className="font-medium flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${selectedSigner === 'localEOA' ? 'border-primary' : 'border-gray-600'}`}
                  >
                    {selectedSigner === 'localEOA' && 
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    }
                  </div>
                  Local Key
                </div>
                <p className="text-sm text-gray-400 mt-1 ml-6">
                  Generate a local key stored in your browser. Encrypted and easy to backup.
                </p>
              </div>
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
              disabled={!label || !selectedSigner || isSubmitting}
              className="btn-primary px-4 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Burner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 