import { useState } from 'react';
import { parseUnits } from 'viem';
import { Address, http, encodeFunctionData, zeroAddress } from 'viem';
import { base, optimism, arbitrum } from 'viem/chains';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import { SUPPORTED_STABLES } from '../config/tokens';
import { getRpcProviderForChain } from '@/utils/provider';
import { erc20Abi } from 'viem';
import toast from 'react-hot-toast';
import { getNetworkConfig } from '../config/networks';
import { TokenInfo, Wallet } from '../types/wallet';
import { getValidator } from './useTransferToken';
import { fetchAllBalances } from './useTokenBalances';
import { KERNEL_V3_1 } from '@zerodev/sdk/constants';

const SPOKE_POOLS: { [chainId: number]: Address } = {
  [base.id]: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64',
  [arbitrum.id]: '0xe35e9842fceaca96570b734083f4a58e8f7c5f2a',
  [optimism.id]: '0x6f26Bf09B1C792e3228e5467807a900A503c0281',
};

const acrossAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'depositor', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'address', name: 'inputToken', type: 'address' },
      { internalType: 'address', name: 'outputToken', type: 'address' },
      { internalType: 'uint256', name: 'inputAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'outputAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
      { internalType: 'address', name: 'exclusiveRelayer', type: 'address' },
      { internalType: 'uint32', name: 'quoteTimestamp', type: 'uint32' },
      { internalType: 'uint32', name: 'fillDeadline', type: 'uint32' },
      { internalType: 'uint32', name: 'exclusivityDeadline', type: 'uint32' },
      { internalType: 'bytes', name: 'message', type: 'bytes' },
    ],
    name: 'depositV3',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

type TransferStep = 'input' | 'preparing' | 'confirming';

export function useCrossChainTransfer(address: string) {
  const [isLoading, setIsLoading] = useState(false);

  const transfer = async (
    sourceChainId: number,
    destChainId: number,
    amount: string,
    selectedToken: TokenInfo,
    from: Address,
    to: Address,
    onStep?: (step: TransferStep) => void,
  ) => {
    if (isLoading) throw new Error('Already transferring');
    setIsLoading(true);
    const toastId = toast.loading('⏳ Preparing transaction...');

    try {
      // Get token configs for source and destination chains
      const sourceTokenConfig = selectedToken.networks.find((n) => n.chain.id === sourceChainId);
      const destTokenConfig = selectedToken.networks.find((n) => n.chain.id === destChainId);

      if (!sourceTokenConfig || !destTokenConfig)
        throw new Error(`${selectedToken.symbol} not supported on this network pair`);

      // Get spoke pool address
      const spokePool = SPOKE_POOLS[sourceChainId];
      if (!spokePool) throw new Error('Source chain not supported');

      // Calculate output amount (input - fee)
      const inputAmount = parseUnits(amount, selectedToken.decimals);
      const fee = parseUnits('0.1', selectedToken.decimals); // 0.1 token fee
      const outputAmount = inputAmount - fee;

      if (outputAmount <= 0n) {
        throw new Error('Amount too small for cross-chain transfer');
      }

      // Setup validator and account
      const networkConfig = getNetworkConfig(sourceChainId);
      const publicClient = getRpcProviderForChain(networkConfig.chain);
      const validator = await getValidator({ address } as Wallet, publicClient, networkConfig.entryPoint);
      const account = await createKernelAccount(publicClient, {
        plugins: { sudo: validator },
        entryPoint: networkConfig.entryPoint,
        kernelVersion: KERNEL_V3_1,
      });

      const kernelClient = createKernelAccountClient({
        account,
        entryPoint: networkConfig.entryPoint,
        chain: networkConfig.chain,
        bundlerTransport: http(networkConfig.bundlerUrl),
        middleware: {
          sponsorUserOperation: async ({ userOperation }) => {
            const zerodevPaymaster = createZeroDevPaymasterClient({
              chain: networkConfig.chain,
              entryPoint: networkConfig.entryPoint,
              transport: http(networkConfig.paymasterUrl),
            });
            return zerodevPaymaster.sponsorUserOperation({
              userOperation,
              entryPoint: networkConfig.entryPoint,
            });
          },
        },
      });

      onStep?.('preparing');

      // Encode approve and deposit data
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spokePool, inputAmount],
      });

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const depositData = encodeFunctionData({
        abi: acrossAbi,
        functionName: 'depositV3',
        args: [
          from, // depositor
          to, // recipient
          sourceTokenConfig.address as Address, // inputToken
          zeroAddress, // outputToken, address(0) if auto resolve
          inputAmount, // inputAmount
          outputAmount, // outputAmount (input - fee)
          BigInt(destChainId), // destinationChainId
          zeroAddress, // exclusiveRelayer
          currentTimestamp, // quoteTimestamp
          currentTimestamp + 120, // fillDeadline (2 minutes)
          0, // exclusivityDeadline
          '0x', // message
        ],
      });

      onStep?.('confirming');

      // Send batch transaction with proper sponsorship
      const hash = await kernelClient.sendTransactions({
        account, // Make sure account is passed
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
      });

      toast.success('✨ Cross-chain transfer initiated!', { id: toastId });
      await fetchAllBalances([from]);

      return hash;
    } catch (error: any) {
      console.error('Transfer failed:', error);
      toast.error(`😅 Transfer failed: ${error.message}`, { id: toastId });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { transfer, isLoading };
}
