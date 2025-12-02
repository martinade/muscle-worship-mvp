import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/tokenUtils';
import { getWalletBalance } from '@/lib/wallet/walletUtils';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token, 'access');
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get wallet balance
    const balance = await getWalletBalance(userId);

    return NextResponse.json({
      user_id: userId,
      balance_wc: balance,
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve balance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
