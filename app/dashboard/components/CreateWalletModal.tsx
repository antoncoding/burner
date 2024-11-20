import { useState } from 'react';
import {
  SignerType,
  CreateWalletFormData,
  WalletVendor,
  WALLET_IMPLEMENTATIONS,
} from '../types/wallet';
import { IoCopyOutline } from 'react-icons/io5';
import Image from 'next/image';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWalletFormData) => Promise<void>;
};

export function CreateWalletModal({ isOpen, onClose, onSubmit }: Props) {
  const [label, setLabel] = useState('');
  const [selectedSigner, setSelectedSigner] = useState<SignerType | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<WalletVendor>('zerodev');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSigner) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        label,
        signerType: selectedSigner,
        vendor: 'zerodev',
      });
      onClose();
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-box-secondary w-full max-w-md rounded-lg p-6">
        <h2 className="mb-4 text-xl font-bold">Create New Burner</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="mb-2 block">Burner Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-box-primary w-full rounded border border-gray-600 p-2 focus:border-primary focus:outline-none"
              placeholder="e.g., ETH Global Prize"
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block">Choose Your Signer</label>
            <div className="space-y-3">
              <div
                className={`cursor-pointer rounded-lg p-4 transition-all ${
                  selectedSigner === 'passkey'
                    ? 'border-2 border-primary bg-primary/10 shadow-sm'
                    : 'border border-gray-600 hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedSigner('passkey');
                  setSelectedVendor('zerodev');
                }}
              >
                <div className="flex items-center gap-2 font-medium">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2
                    ${selectedSigner === 'passkey' ? 'border-primary' : 'border-gray-600'}`}
                  >
                    {selectedSigner === 'passkey' && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  Passkey
                </div>
                <p className="ml-6 mt-1 text-sm text-gray-400">
                  Use your device's biometric authentication for secure signing
                </p>
              </div>

              <div
                className={`cursor-pointer rounded-lg p-4 transition-all ${
                  selectedSigner === 'localEOA'
                    ? 'border-2 border-primary bg-primary/10 shadow-sm'
                    : 'border border-gray-600 hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedSigner('localEOA');
                  setSelectedVendor('zerodev');
                }}
              >
                <div className="flex items-center gap-2 font-medium">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2
                    ${selectedSigner === 'localEOA' ? 'border-primary' : 'border-gray-600'}`}
                  >
                    {selectedSigner === 'localEOA' && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  Local Key
                </div>
                <p className="ml-6 mt-1 text-sm text-gray-400">
                  Generate a local key stored in your browser. Encrypted and easy to backup.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-box-hovered rounded px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!label || !selectedSigner || isSubmitting}
              className="btn-primary rounded px-4 py-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Burner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
