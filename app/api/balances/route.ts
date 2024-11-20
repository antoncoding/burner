import { NextRequest, NextResponse } from 'next/server'

const INCH_API_KEY = process.env.ONEINCHE_KEY;

console.log('INCH_API_KEY', INCH_API_KEY)

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const address = searchParams.get('address')
  const chainId = searchParams.get('chainId')

  if (!address || !chainId) {
    return NextResponse.json(
      { error: 'Missing address or chainId' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://api.1inch.dev/balance/v1.2/${chainId}/balances/${address}`,
      {
        headers: {
          'Authorization': `Bearer ${INCH_API_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      console.log('error', response)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    )
  }
} 