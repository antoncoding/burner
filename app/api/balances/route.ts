import { NextRequest, NextResponse } from 'next/server';

const INCH_API_KEY = '0rSrfQPlKkOGeEmJ1dVENdgnJhkDjSWt';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get('address');
  const chainId = searchParams.get('chainId');

  if (!address || !chainId) {
    return NextResponse.json({ error: 'Missing address or chainId' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://proxy-app.1inch.io/v2.0/balance/v1.2/${chainId}/balances/${address}`,
      {
        headers: {
          Authorization: `Bearer ${INCH_API_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch balances:', error);
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
  }
}
