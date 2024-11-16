import { Address, parseUnits, http, encodeFunctionData, createWalletClient } from 'viem'
import { base } from 'viem/chains'
import { 
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk"
import { createSmartAccountClient } from "@biconomy/account"
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
import { fetchAllBalances } from './useTokenBalances'
import { PasskeyValidatorContractVersion, toPasskeyValidator, toWebAuthnKey, WebAuthnMode } from "@zerodev/passkey-validator"
import { 
  createNexusClient, 
  createBicoPaymasterClient 
} from "@biconomy/sdk"

const toastStyle = {
  style: {
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-background-hovered)',
    padding: '16px',
    borderRadius: '12px',
  }
}

type TransferStep = 'input' | 'preparing' | 'confirming'

const PASSKEY_SERVER_URL = 'https://passkeys.zerodev.app/api/v4'

export async function transferUSDC({
  from,
  to,
  amount,
  wallet,
  chainId = base.id,
  onStep,
}: {
  from: Address
  to: Address
  amount: string
  wallet: Wallet
  chainId?: number
  onStep?: (step: TransferStep) => void
}) {
  const toastId = toast.loading('🔄 Preparing transfer...', toastStyle)

  try {
    onStep?.('preparing')
    const networkConfig = getNetworkConfig(chainId)
    const publicClient = getRpcProviderForChain(networkConfig.chain)

    // Get USDC token config
    const usdcToken = SUPPORTED_STABLES.find(t => t.symbol === 'USDC')
    if (!usdcToken) throw new Error('USDC token config not found')

    // Get network specific USDC address
    const tokenConfig = usdcToken.networks.find(n => n.chain.id === chainId)
    if (!tokenConfig) throw new Error('USDC not supported on this network')

    // Encode transfer data
    const transferData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, parseUnits(amount, usdcToken.decimals)]
    })

    let userOpHash: string
    let receipt: any

    const storedWallet = JSON.parse(localStorage.getItem('storedWallets') || '[]').find((w: any) => w.address === wallet.address)

    if (wallet.vendor === 'biconomy') {
      if (!storedWallet?.privateKey) throw new Error('Private key not found')

      // Create Biconomy account
      const account = privateKeyToAccount(storedWallet.privateKey as `0x${string}`)

      // Create Nexus client with paymaster
      const nexusClient = await createNexusClient({
        signer: account,
        chain: networkConfig.chain,
        transport: http(),
        bundlerTransport: http(`https://bundler.biconomy.io/api/v3/${chainId}/IGh7f8l_Y.cb47412c-43c8-459e-815f-fd3abcaaef19`),
        paymaster: createBicoPaymasterClient({
          paymasterUrl: `https://paymaster.biconomy.io/api/v1/8453/IGh7f8l_Y.cb47412c-43c8-459e-815f-fd3abcaaef19`
        }),
      })

      onStep?.('confirming')

      // Send transaction
      const hash = await nexusClient.sendTransaction({
        calls: [{
          to: tokenConfig.address as `0x${string}`,
          data: transferData,
          value: BigInt(0)
        }]
      })

      // Wait for receipt
      receipt = await nexusClient.waitForTransactionReceipt({ hash })
      userOpHash = hash

    } else {
      // ZeroDev flow - handle both passkey and local key
      const validator = await getValidator(wallet, publicClient, networkConfig.entryPoint as EntryPoint)

      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: validator,
        },
        entryPoint: networkConfig.entryPoint as EntryPoint,
        kernelVersion: KERNEL_V3_1
      })

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
              transport: http(networkConfig.paymasterUrl),
            })
            return zerodevPaymaster.sponsorUserOperation({
              userOperation,
              entryPoint: networkConfig.entryPoint,
            })
          }
        }
      })

      userOpHash = await kernelClient.sendUserOperation({
        account,
        userOperation: {
          callData: await account.encodeCallData({
            to: tokenConfig.address as `0x${string}`,
            data: transferData,
            value: BigInt(0),
          }),
        },
      })
      onStep?.('confirming')

      const bundlerClient = kernelClient.extend(bundlerActions(networkConfig.entryPoint))
      receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash as `0x${string}`
      })
    }

    if (receipt) {
      toast.success('✨ Transfer complete!', { id: toastId })
      await fetchAllBalances([from, to])
    } else {
      throw new Error('Transaction failed')
    }

  } catch (error) {
    console.error('Transfer failed:', error)
    toast.error('😅 Transfer failed', { id: toastId })
    throw error
  }
} 

// Helper function to get validator based on wallet type
async function getValidator(wallet: Wallet, publicClient: any, entryPoint: EntryPoint) {
  if (wallet.type === 'passkey') {
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: wallet.label,
      passkeyServerUrl: PASSKEY_SERVER_URL,
      mode: WebAuthnMode.Login,
      passkeyServerHeaders: {}
    })

    return await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint,
      kernelVersion: KERNEL_V3_1,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
    })
  } else {
    // Get private key from storage for local EOA
    const stored = JSON.parse(localStorage.getItem('storedWallets') || '[]')
    const storedWallet = stored.find((w: any) => w.address === wallet.address)
    if (!storedWallet?.privateKey) throw new Error('Private key not found')

    const signer = privateKeyToAccount(storedWallet.privateKey as `0x${string}`)
    return await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint,
      kernelVersion: KERNEL_V3_1
    })
  }
}