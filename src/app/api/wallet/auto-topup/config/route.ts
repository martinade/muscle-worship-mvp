import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 401 }
      );
    }

    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('auto_topup_enabled, auto_topup_threshold_wc, auto_topup_amount_wc')
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch auto-top-up settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enabled: wallet.auto_topup_enabled,
      threshold: wallet.auto_topup_threshold_wc,
      amount: wallet.auto_topup_amount_wc,
    });
  } catch (error) {
    console.error('Auto-top-up config fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { enabled, threshold, amount } = body;

    if (threshold !== undefined && threshold < 0) {
      return NextResponse.json(
        { error: 'Threshold must be non-negative' },
        { status: 400 }
      );
    }

    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (enabled !== undefined) updates.auto_topup_enabled = enabled;
    if (threshold !== undefined) updates.auto_topup_threshold_wc = threshold;
    if (amount !== undefined) updates.auto_topup_amount_wc = amount;

    const { error } = await supabase
      .from('wallets')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update auto-top-up settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auto-top-up config update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
