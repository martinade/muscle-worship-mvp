import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { verifyToken, generateAccessToken } from '@/lib/auth/tokenUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface SuccessResponse {
  success: true;
}

interface ErrorResponse {
  success: false;
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Read refreshToken from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      // Clear both cookies
      res.setHeader('Set-Cookie', [
        `accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        `refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
      ]);

      return res.status(401).json({
        success: false,
        error: 'Session expired',
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, 'refresh');

    if (!decoded || !decoded.userId) {
      // Clear both cookies
      res.setHeader('Set-Cookie', [
        `accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        `refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
      ]);

      return res.status(401).json({
        success: false,
        error: 'Session expired',
      });
    }

    // Fetch user role from database
    const { data: user, error: userError } = (await supabase
      .from('users')
      .select('role')
      .eq('user_id', decoded.userId)
      .single()) as { data: { role: string } | null; error: any };

    if (userError || !user) {
      // Clear both cookies
      res.setHeader('Set-Cookie', [
        `accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        `refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
      ]);

      return res.status(401).json({
        success: false,
        error: 'Session expired',
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      role: user.role,
    });

    // Set new accessToken cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', 
      `accessToken=${newAccessToken}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=${15 * 60}` // 15 minutes
    );

    return res.status(200).json({
      success: true,
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear both cookies on error
    res.setHeader('Set-Cookie', [
      `accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
      `refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
    ]);

    return res.status(401).json({
      success: false,
      error: 'Session expired',
    });
  }
}
