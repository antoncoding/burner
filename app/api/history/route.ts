import { NextRequest, NextResponse } from 'next/server';

const INCH_API_KEY = process.env.ONEINCHE_KEY;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.1inch.dev/history/v2.0/history/${address}/events`, {
      headers: {
        Authorization: `Bearer ${INCH_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
