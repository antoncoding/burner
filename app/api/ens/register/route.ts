import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const REGISTER_PK = process.env.REGISTER_PK;

const REGISTRAR_ADDRESS = '0xfC0d338Ff0f0e4F545AE0Abba0d19aa467483FA7';

const registryAbi = [
  {
    inputs: [
      { internalType: 'string', name: 'label', type: 'string' },
      { internalType: 'address', name: 'owner', type: 'address' },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    const { name, address } = await req.json();

    // Create wallet client with the registrar private key
    const account = privateKeyToAccount(REGISTER_PK as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    // Send registration transaction
    const hash = await client.writeContract({
      address: REGISTRAR_ADDRESS,
      abi: registryAbi,
      functionName: 'register',
      args: [name, address],
    });

    return NextResponse.json({ success: true, hash });
  } catch (error) {
    console.error('Failed to register ENS:', error);
    return NextResponse.json({ error: 'Failed to register ENS' }, { status: 500 });
  }
}
