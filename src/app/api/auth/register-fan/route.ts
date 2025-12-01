import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/auth/passwordUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface RegisterFanRequest {
  email: string;
  username: string;
  password: string;
  date_of_birth: string;
  country: string;
  city?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterFanRequest = await req.json();
    const { email, username, password, date_of_birth, country, city } = body;

    // Validation: Required fields
    if (!email || !username || !password || !date_of_birth || !country) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'Email, username, password, date of birth, and country are required'
        },
        { status: 400 }
      );
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validation: Password strength (min 8 chars)
    if (password.length < 8) {
      return NextResponse.json(
        { 
          error: 'Weak password',
          details: 'Password must be at least 8 characters long'
        },
        { status: 400 }
      );
    }

    // Validation: Age 18+
    const birthDate = new Date(date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json(
        { 
          error: 'Underage',
          details: 'You must be at least 18 years old to register'
        },
        { status: 400 }
      );
    }

    // Check: Email not already taken
    const { data: existingEmail } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { 
          error: 'Duplicate email',
          details: 'An account with this email already exists'
        },
        { status: 409 }
      );
    }

    // Check: Username not already taken
    const { data: existingUsername } = await supabase
      .from('users')
      .select('user_id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { 
          error: 'Duplicate username',
          details: 'This username is already taken'
        },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert into Users table
    const { data: newUser, error: userError } = (await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash,
        role: 'fan',
        date_of_birth,
        country,
        city: city || null,
      })
      .select('user_id')
      .single()) as { data: { user_id: string } | null; error: any };

    if (userError || !newUser) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { 
          error: 'Failed to create user',
          details: userError?.message
        },
        { status: 500 }
      );
    }

    const userId = newUser.user_id;

    // Note: Wallet is automatically created by database trigger

    // Create FanProfile
    const { error: profileError } = await supabase
      .from('fanprofiles')
      .insert({
        user_id: userId,
        total_bookings: 0,
        no_show_count: 0,
        late_cancellation_count: 0,
      });

    if (profileError) {
      console.error('Fan profile creation error:', profileError);
      // Rollback: Delete user (cascade will delete wallet)
      await supabase.from('users').delete().eq('user_id', userId);
      return NextResponse.json(
        { 
          error: 'Failed to create fan profile',
          details: profileError.message
        },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json(
      {
        message: 'Fan account created successfully',
        userId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
