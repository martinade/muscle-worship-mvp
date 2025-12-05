import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/tokenUtils';
import { initiatePayment } from '@/lib/pgal';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    console.log('Cookie store keys:', Array.from(cookieStore.getAll()).map(c => c.name));
    console.log('Access token found:', !!token);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token, 'access');
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount_usd } = body;

    if (!amount_usd || typeof amount_usd !== 'number') {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (amount_usd < 10) {
      return NextResponse.json(
        { error: 'Minimum amount is $10' },
        { status: 400 }
      );
    }

    if (amount_usd > 1000) {
      return NextResponse.json(
        { error: 'Maximum amount is $1000' },
        { status: 400 }
      );
    }

    const { url } = await initiatePayment('stripe', amount_usd, payload.userId);

    return NextResponse.json({ checkout_url: url }, { status: 200 });
  } catch (error) {
    console.error('Create checkout error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
