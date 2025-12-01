import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { verifyPassword } from '@/lib/auth/passwordUtils';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/tokenUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface LoginRequest {
  email: string;
  password: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
  warning?: string;
}

interface SuccessResponse {
  success: true;
  user: {
    user_id: string;
    role: string;
    username: string;
  };
  warning?: string;
}

// Rate limiting store (in-memory, per IP)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt || now > attempt.resetTime) {
    // Reset or create new entry
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 minutes
    return { allowed: true };
  }

  if (attempt.count >= 5) {
    const remainingTime = Math.ceil((attempt.resetTime - now) / 1000 / 60); // minutes
    return { allowed: false, remainingTime };
  }

  attempt.count++;
  return { allowed: true };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get IP address for rate limiting
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
               req.socket.remoteAddress || 
               'unknown';

    // Check rate limit
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        error: 'Too many login attempts',
        details: `Please try again in ${rateLimitCheck.remainingTime} minutes`
      });
    }

    const { email, password }: LoginRequest = req.body;

    // Validation: Required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Email and password are required'
      });
    }

    // Query Users table for email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, email, username, password_hash, role, account_status')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Email not found or incorrect password'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Email not found or incorrect password'
      });
    }

    // Check account status
    if (user.account_status === 'banned') {
      return res.status(403).json({ 
        error: 'Account banned',
        details: 'Your account has been banned. Please contact support.'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.user_id,
    });

    // Set HTTP-only cookies
    res.setHeader('Set-Cookie', [
      `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${15 * 60}`, // 15 minutes
      `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`, // 7 days
    ]);

    // Prepare response
    const response: SuccessResponse = {
      success: true,
      user: {
        user_id: user.user_id,
        role: user.role,
        username: user.username,
      },
    };

    // Add warning if account is dormant
    if (user.account_status === 'dormant') {
      response.warning = 'Your account has been marked as dormant due to inactivity. Welcome back!';
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
