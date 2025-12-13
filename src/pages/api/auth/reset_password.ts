import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/auth/passwordUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface RequestBody {
  token: string;
  new_password: string;
}

interface SuccessResponse {
  success: true;
  message: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, new_password }: RequestBody = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Token and new_password are required',
      });
    }

    // Validate password strength
    if (new_password.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        details: 'Password must be at least 8 characters long',
      });
    }

    // Query Users where password_reset_token = token AND password_reset_expires > NOW()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, password_reset_token, password_reset_expires')
      .eq('password_reset_token', token)
      .single();

    if (userError || !user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        details: 'The reset link is invalid or has expired',
      });
    }

    // Check if token has expired
    const expiresAt = new Date(user.password_reset_expires);
    const now = new Date();

    if (expiresAt <= now) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        details: 'The reset link has expired',
      });
    }

    // Hash new password
    const password_hash = await hashPassword(new_password);

    // Update Users: set new password and clear reset token fields
    const { error: updateError } = (await supabase
      .from('users')
      .update({
        password_hash,
        password_reset_token: null,
        password_reset_expires: null,
      })
      .eq('user_id', user.user_id)) as { error: any };

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return res.status(500).json({
        error: 'Failed to reset password',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
