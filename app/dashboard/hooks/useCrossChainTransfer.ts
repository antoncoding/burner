import { Address, parseUnits, http, encodeFunctionData, zeroAddress } from 'viem'
import { base, mainnet, optimism, arbitrum } from 'viem/chains'
import { 
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk"
import { SUPPORTED_STABLES } from '../config/tokens'
import { getRpcProviderForChain } from '@/utils/provider'
import { erc20Abi } from 'viem'
import toast from 'react-hot-toast'
import { getNetworkConfig } from '../config/networks'
import { Wallet } from '../types/wallet'
import { getValidator } from './useTransferToken'
import { fetchAllBalances } from './useTokenBalances'
import { KERNEL_V3_1 } from '@zerodev/sdk/constants'

const SPOKE_POOLS: { [chainId: number]: Address } = {
  [base.id]: '0x09aea4b2242abc8bb4bb78d537a67a245a7bec64',
  [arbitrum.id]: '0xe35e9842fceaca96570b734083f4a58e8f7c5f2a',
  [optimism.id]: '0x6f26Bf09B1C792e3228e5467807a900A503c0281',
}

const acrossAbi = [{
  "inputs": [
    { "internalType": "address", "name": "depositor", "type": "address" },
    { "internalType": "address", "name": "recipient", "type": "address" },
    { "internalType": "address", "name": "inputToken", "type": "address" },
    { "internalType": "address", "name": "outputToken", "type": "address" },
    { "internalType": "uint256", "name": "inputAmount", "type": "uint256" },
    { "internalType": "uint256", "name": "outputAmount", "type": "uint256" },
    { "internalType": "uint256", "name": "destinationChainId", "type": "uint256" },
    { "internalType": "address", "name": "exclusiveRelayer", "type": "address" },
    { "internalType": "uint32", "name": "quoteTimestamp", "type": "uint32" },
    { "internalType": "uint32", "name": "fillDeadline", "type": "uint32" },
    { "internalType": "uint32", "name": "exclusivityDeadline", "type": "uint32" },
    { "internalType": "bytes", "name": "message", "type": "bytes" }
  ],
  "name": "depositV3",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
}] as const

type TransferStep = 'input' | 'preparing' | 'confirming'

export async function transferCrossChain({
  from,
  to,
  amount,
  wallet,
  sourceChainId = base.id,
  destinationChainId,
  onStep,
}: {
  from: Address
  to: Address
  amount: string
  wallet: Wallet
  sourceChainId?: number
  destinationChainId: number
  onStep?: (step: TransferStep) => void
}) {
  const toastId = toast.loading('🔄 Preparing cross-chain transfer...', {
    style: {
      background: 'var(--color-background-secondary)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-background-hovered)',
      padding: '16px',
      borderRadius: '12px',
    }
  })

  try {
    onStep?.('preparing')
    const networkConfig = getNetworkConfig(sourceChainId)
    const publicClient = getRpcProviderForChain(networkConfig.chain)

    // Get USDC token config
    const usdcToken = SUPPORTED_STABLES.find(t => t.symbol === 'USDC')
    if (!usdcToken) throw new Error('USDC token config not found')

    // Get network specific USDC addresses
    const sourceTokenConfig = usdcToken.networks.find(n => n.chain.id === sourceChainId)
    const destTokenConfig = usdcToken.networks.find(n => n.chain.id === destinationChainId)
    if (!sourceTokenConfig || !destTokenConfig) throw new Error('USDC not supported on this network pair')

    // Get spoke pool address
    const spokePool = SPOKE_POOLS[sourceChainId]
    console.log('spokePool', spokePool)
    if (!spokePool) throw new Error('Source chain not supported')

    // Calculate output amount (input - fee)
    const inputAmount = parseUnits(amount, usdcToken.decimals)
    const fee = parseUnits('0.1', usdcToken.decimals) // 0.1 USDC fee
    const outputAmount = inputAmount - fee

    if (outputAmount <= 0n) {
      throw new Error('Amount too small for cross-chain transfer')
    }

    // Setup validator and account
    const validator = await getValidator(wallet, publicClient, networkConfig.entryPoint)
    const account = await createKernelAccount(publicClient, {
      plugins: { sudo: validator },
      entryPoint: networkConfig.entryPoint,
      kernelVersion: KERNEL_V3_1
    })

    // Create kernel client with proper middleware
    const kernelClient = createKernelAccountClient({
      account,
      entryPoint: networkConfig.entryPoint,
      chain: networkConfig.chain,
      bundlerTransport: http(networkConfig.bundlerUrl),
      middleware: {
        // Important: This is where the sponsorship happens
        sponsorUserOperation: async ({ userOperation }) => {
          const zerodevPaymaster = createZeroDevPaymasterClient({
            chain: networkConfig.chain,
            entryPoint: networkConfig.entryPoint,
            transport: http(networkConfig.paymasterUrl),
          })

          const sponsored = await zerodevPaymaster.sponsorUserOperation({
            userOperation,
            entryPoint: networkConfig.entryPoint,
          })

          return {
            ...sponsored,
            // Make sure paymasterAndData is properly set
            paymasterAndData: sponsored.paymasterAndData || '0x'
          }
        }
      }
    })

    // Encode approve and deposit data
    const approveData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spokePool, inputAmount]
    })

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const depositData = encodeFunctionData({
      abi: acrossAbi,
      functionName: 'depositV3',
      args: [
        from,                   // depositor
        to,                     // recipient
        sourceTokenConfig.address as Address,  // inputToken
        zeroAddress,           // outputToken, address(0) if auto resolve
        inputAmount,            // inputAmount
        outputAmount,           // outputAmount (input - fee)
        BigInt(destinationChainId),  // destinationChainId
        zeroAddress,           // exclusiveRelayer
        currentTimestamp,       // quoteTimestamp
        currentTimestamp + 120, // fillDeadline (2 minutes)
        0,                      // exclusivityDeadline
        '0x'                    // message
      ]
    })

    onStep?.('confirming')
    // Send batch transaction with proper sponsorship
    const hash = await kernelClient.sendTransactions({
      account,  // Make sure account is passed
      transactions: [
        {
          to: sourceTokenConfig.address as Address,
          value: BigInt(0),
          data: approveData,
        },
        {
          to: spokePool,
          value: BigInt(0),
          data: depositData,
        },
      ],
    })

    toast.success('✨ Cross-chain transfer initiated!', { id: toastId })
    await fetchAllBalances([from])

    return hash
  } catch (error) {
    console.error('Cross-chain transfer failed:', error)
    toast.error('😅 Transfer failed', { id: toastId })
    throw error
  }
} 