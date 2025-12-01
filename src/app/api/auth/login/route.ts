import { NextRequest, NextResponse } from 'next/server';
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

// Rate limiting store (in-memory, per IP)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return { allowed: true };
  }

  if (attempt.count >= 5) {
    const remainingTime = Math.ceil((attempt.resetTime - now) / 1000 / 60);
    return { allowed: false, remainingTime };
  }

  attempt.count++;
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.ip || 
               'unknown';

    // Check rate limit
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({ 
        error: 'Too many login attempts',
        details: `Please try again in ${rateLimitCheck.remainingTime} minutes`
      }, { status: 429 });
    }

    const body: LoginRequest = await req.json();
    const { email, password } = body;

    // Validation: Required fields
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Email and password are required'
      }, { status: 400 });
    }

    // Query Users table for email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, email, username, password_hash, role, account_status')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Invalid credentials',
        details: 'Email not found or incorrect password'
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Invalid credentials',
        details: 'Email not found or incorrect password'
      }, { status: 401 });
    }

    // Check account status
    if (user.account_status === 'banned') {
      return NextResponse.json({ 
        error: 'Account banned',
        details: 'Your account has been banned. Please contact support.'
      }, { status: 403 });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.user_id,
    });

    // Prepare response
    const response: any = {
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

    // Create response with cookies
    const nextResponse = NextResponse.json(response, { status: 200 });
    
    // Set HTTP-only cookies
    nextResponse.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    nextResponse.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return nextResponse;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
