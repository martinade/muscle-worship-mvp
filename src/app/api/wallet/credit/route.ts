import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { verifyToken } from '@/lib/auth/tokenUtils';
import { creditWallet } from '@/lib/wallet/walletUtils';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { user_id, amount_wc, description } = body;

    // Validation
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'user_id is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof amount_wc !== 'number' || amount_wc <= 0) {
      return NextResponse.json(
        { error: 'amount_wc must be a positive number' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'description is required and must be a string' },
        { status: 400 }
      );
    }

    // Credit wallet
    const newBalance = await creditWallet(user_id, amount_wc, description);

    return NextResponse.json({
      success: true,
      user_id,
      amount_credited: amount_wc,
      new_balance: newBalance,
      description,
    });
  } catch (error) {
    console.error('Credit wallet error:', error);
    return NextResponse.json(
      {
        error: 'Failed to credit wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
