import { Address, createWalletClient, http, encodeFunctionData, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient } from '@biconomy/account';
import { SUPPORTED_STABLES } from '../config/tokens';
import { Wallet } from '../types/wallet';
import toast from 'react-hot-toast';
import { base } from 'viem/chains';
import { erc20Abi } from 'viem';

const BUNDLER_URL =
  'https://bundler.biconomy.io/api/v2/80002/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44';

const toastStyle = {
  style: {
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-background-hovered)',
    padding: '16px',
    borderRadius: '12px',
  },
};

export async function transferUSDCWithBiconomy({
  from,
  to,
  amount,
  wallet,
  chainId = base.id,
}: {
  from: Address;
  to: Address;
  amount: string;
  wallet: Wallet;
  chainId?: number;
}) {
  const toastId = toast.loading('🔄 Preparing Biconomy transfer...', toastStyle);

  try {
    // Get stored wallet data
    const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]');
    const storedWallet = stored.find((w: any) => w.address === wallet.address);
    if (!storedWallet?.privateKey) throw new Error('Private key not found');

    // Create Biconomy account
    const account = privateKeyToAccount(storedWallet.privateKey as `0x${string}`);
    const signer = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    // Create Biconomy Smart Account instance
    const smartWallet = await createSmartAccountClient({
      signer,
      bundlerUrl: BUNDLER_URL,
    });

    // Get USDC token config
    const usdcToken = SUPPORTED_STABLES.find((t) => t.symbol === 'USDC');
    if (!usdcToken) throw new Error('USDC token config not found');

    // Get network specific USDC address
    const tokenConfig = usdcToken.networks.find((n) => n.chain.id === chainId);
    if (!tokenConfig) throw new Error('USDC not supported on this network');

    // Encode transfer data
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, parseUnits(amount, usdcToken.decimals)],
    });

    toast.loading('🔐 Building transaction...', { id: toastId });

    // Build transaction
    const tx = {
      to: tokenConfig.address,
      data,
    };

    // Send transaction
    const userOpResponse = await smartWallet.sendTransaction(tx);

    toast.loading('⏳ Waiting for confirmation...', { id: toastId });

    const { transactionHash } = await userOpResponse.waitForTxHash();
    console.log('Transaction Hash', transactionHash);

    const userOpReceipt = await userOpResponse.wait();
    if (userOpReceipt.success === 'true') {
      toast.success('✨ Transfer complete!', { id: toastId });
      return userOpReceipt;
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('Biconomy transfer failed:', error);
    toast.error('😅 Transfer failed', { id: toastId });
    throw error;
  }
}
