import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { createWallet } from '@/lib/wallet/walletUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface RegisterCreatorRequest {
  email: string;
  username: string;
  password: string;
  date_of_birth: string;
  country: string;
  city?: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

interface SuccessResponse {
  message: string;
  userId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      username,
      password,
      date_of_birth,
      country,
      city,
    }: RegisterCreatorRequest = req.body;

    // Required fields (minimal)
    if (!email || !username || !password || !date_of_birth || !country) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Email, username, password, date of birth, and country are required',
      });
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Weak password',
        details: 'Password must be at least 8 characters long',
      });
    }

    // Age 18+
    const birthDate = new Date(date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return res.status(400).json({
        error: 'Underage',
        details: 'You must be at least 18 years old to register',
      });
    }

    // Duplicate email
    const { data: existingEmail } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return res.status(409).json({
        error: 'Duplicate email',
        details: 'An account with this email already exists',
      });
    }

    // Duplicate username
    const { data: existingUsername } = await supabase
      .from('users')
      .select('user_id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return res.status(409).json({
        error: 'Duplicate username',
        details: 'This username is already taken',
      });
    }

    const password_hash = await hashPassword(password);

    // Create user
    const { data: newUser, error: userError } = (await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash,
        role: 'creator',
        date_of_birth,
        country,
        city: city || null,
      })
      .select('user_id')
      .single()) as { data: { user_id: string } | null; error: any };

    if (userError || !newUser) {
      console.error('User creation error:', userError);
      return res.status(500).json({
        error: 'Failed to create user',
        details: userError?.message,
      });
    }

    const userId = newUser.user_id;

    // Create wallet
    try {
      await createWallet(userId);
    } catch (error) {
      console.error('Wallet creation failed:', error);
      await supabase.from('users').delete().eq('user_id', userId);
      return res.status(500).json({
        error: 'Failed to create wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Create CreatorProfile (no personal stats at registration)
    const { error: profileError } = await supabase
      .from('creatorprofiles')
      .insert({
        user_id: userId,
        tier: 1,
        kyc_verified: false,
        services_offered: ['text_chat', 'community'],
        total_sessions_completed: 0,
        average_rating: 0.0,
        total_reviews: 0,
      });

    if (profileError) {
      console.error('Creator profile creation error:', profileError);
      await supabase.from('users').delete().eq('user_id', userId);
      return res.status(500).json({
        error: 'Failed to create creator profile',
        details: profileError.message,
      });
    }

    return res.status(201).json({
      message: 'Creator account created successfully. KYC verification required before activation.',
      userId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
