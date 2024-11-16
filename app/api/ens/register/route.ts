import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const REGISTER_PK = process.env.REGISTER_PK
console.log('REGISTER_PK', REGISTER_PK)

const REGISTRY_ADDRESS = '0xb14c2408705e1acc425d2e72f65bf0062a7326cc'

const registryAbi = [{
  "inputs": [
    { "internalType": "string", "name": "label", "type": "string" },
    { "internalType": "address", "name": "owner", "type": "address" }
  ],
  "name": "register",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}] as const

export async function POST(req: NextRequest) {
  try {
    const { name, address } = await req.json()

    // Create wallet client with the registrar private key
    const account = privateKeyToAccount(REGISTER_PK as `0x${string}`)
    const client = createWalletClient({
      account,
      chain: base,
      transport: http()
    })

    // Send registration transaction
    const hash = await client.writeContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: 'register',
      args: [name, address]
    })

    return NextResponse.json({ success: true, hash })
  } catch (error) {
    console.error('Failed to register ENS:', error)
    return NextResponse.json(
      { error: 'Failed to register ENS' },
      { status: 500 }
    )
  }
} 