import { Address, parseUnits, http, encodeFunctionData } from 'viem'
import { base } from 'viem/chains'
import { 
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { SUPPORTED_STABLES } from '../config/tokens'
import { getRpcProviderForChain } from '@/utils/provider'
import { erc20Abi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import toast from 'react-hot-toast'
import { getNetworkConfig } from '../config/networks'
import { Wallet } from '../types/wallet'
import { KERNEL_V3_1 } from '@zerodev/sdk/constants'
import { bundlerActions } from 'permissionless'
import { EntryPoint } from 'permissionless/types'

const toastStyle = {
  style: {
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-background-hovered)',
    padding: '16px',
    borderRadius: '12px',
  }
}

export async function transferUSDC({
  from,
  to,
  amount,
  wallet,
  chainId = base.id
}: {
  from: Address
  to: Address
  amount: string
  wallet: Wallet
  chainId?: number
}) {
  const toastId = toast.loading('🔄 Preparing transfer...', toastStyle)

  try {
    // Get network config
    const networkConfig = getNetworkConfig(chainId)
    const publicClient = getRpcProviderForChain(networkConfig.chain)

    // Get USDC token config
    const usdcToken = SUPPORTED_STABLES.find(t => t.symbol === 'USDC')
    if (!usdcToken) throw new Error('USDC token config not found')

    // Get network specific USDC address
    const tokenConfig = usdcToken.networks.find(n => n.chain.id === chainId)
    if (!tokenConfig) throw new Error('USDC not supported on this network')

    // Get stored wallet data if it's a local EOA
    if (wallet.type !== 'localEOA') {
      throw new Error('Only local EOA wallets supported for now')
    }

    // Get private key from storage
    const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]')
    const storedWallet = stored.find((w: any) => w.address === wallet.address)
    if (!storedWallet?.privateKey) throw new Error('Private key not found')

    const signer = privateKeyToAccount(storedWallet.privateKey as `0x${string}`)
    const validator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint: networkConfig.entryPoint,
      kernelVersion: KERNEL_V3_1
    })

    // Create kernel account
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: validator,
      },
      entryPoint: networkConfig.entryPoint as EntryPoint,
      kernelVersion: KERNEL_V3_1
    })

    // Create kernel client
    const kernelClient = createKernelAccountClient({
      account,
      entryPoint: networkConfig.entryPoint as EntryPoint,
      chain: networkConfig.chain,
      bundlerTransport: http(networkConfig.bundlerUrl),
      middleware: {
        sponsorUserOperation: async ({ userOperation }) => {
          const zerodevPaymaster = createZeroDevPaymasterClient({
            chain: networkConfig.chain,
            entryPoint: networkConfig.entryPoint,
            // Get this RPC from ZeroDev dashboard
            transport: http(networkConfig.paymasterUrl),
          })
          return zerodevPaymaster.sponsorUserOperation({
            userOperation,
            entryPoint: networkConfig.entryPoint,
          })
        }
      }
    })

    // Encode transfer data
    const transferData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, parseUnits(amount, usdcToken.decimals)]
    })

    toast.loading('🔐 Sending transaction...', { id: toastId })

    // Send transaction
    const userOpHash = await kernelClient.sendUserOperation({
      account,
      userOperation: {
        callData: await account.encodeCallData({
          to: tokenConfig.address as `0x${string}`,
          data: transferData,
          value: BigInt(0),
        }),
      },
    })

    toast.loading('⏳ Waiting for confirmation...', { id: toastId })

    // Create bundler client and wait for receipt
    const bundlerClient = kernelClient.extend(bundlerActions(networkConfig.entryPoint))
    await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash
    })

    toast.success('✨ Transfer complete!', { id: toastId })

  } catch (error) {
    console.error('Transfer failed:', error)
    toast.error('😅 Transfer failed', { id: toastId })
    throw error
  }
} 