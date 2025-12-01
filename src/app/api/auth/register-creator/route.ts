import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/auth/passwordUtils';

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
  gender: string;
  orientation: string;
  height_cm: number;
  weight_kg: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterCreatorRequest = await req.json();
    const { 
      email, 
      username, 
      password, 
      date_of_birth, 
      country, 
      city,
      gender,
      orientation,
      height_cm,
      weight_kg
    } = body;

    // Validation: Required fields
    if (!email || !username || !password || !date_of_birth || !country || !gender || !orientation || !height_cm || !weight_kg) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Email, username, password, date of birth, country, gender, orientation, height, and weight are required'
      }, { status: 400 });
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validation: Password strength (min 8 chars)
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Weak password',
        details: 'Password must be at least 8 characters long'
      }, { status: 400 });
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
      return NextResponse.json({ 
        error: 'Underage',
        details: 'You must be at least 18 years old to register'
      }, { status: 400 });
    }

    // Validation: Height and weight ranges
    if (height_cm < 100 || height_cm > 250) {
      return NextResponse.json({ 
        error: 'Invalid height',
        details: 'Height must be between 100 and 250 cm'
      }, { status: 400 });
    }

    if (weight_kg < 30 || weight_kg > 300) {
      return NextResponse.json({ 
        error: 'Invalid weight',
        details: 'Weight must be between 30 and 300 kg'
      }, { status: 400 });
    }

    // Check: Email not already taken
    const { data: existingEmail } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json({ 
        error: 'Duplicate email',
        details: 'An account with this email already exists'
      }, { status: 409 });
    }

    // Check: Username not already taken
    const { data: existingUsername } = await supabase
      .from('users')
      .select('user_id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json({ 
        error: 'Duplicate username',
        details: 'This username is already taken'
      }, { status: 409 });
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
        role: 'creator',
        date_of_birth,
        country,
        city,
        account_status: 'active'
      })
      .select('user_id')
      .single()) as { data: { user_id: string } | null; error: any };

    if (userError || !newUser) {
      console.error('User creation error:', userError);
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: userError?.message 
      }, { status: 500 });
    }

    // Insert into CreatorProfiles table
    const { error: profileError } = await supabase
      .from('creatorprofiles')
      .insert({
        user_id: newUser.user_id,
        gender,
        orientation,
        height_cm,
        weight_kg,
        tier: 1,
        kyc_verified: false,
        total_sessions_completed: 0,
        average_rating: 0,
        total_reviews: 0
      });

    if (profileError) {
      console.error('Creator profile creation error:', profileError);
      // Rollback: Delete the user if profile creation fails
      await supabase.from('users').delete().eq('user_id', newUser.user_id);
      return NextResponse.json({ 
        error: 'Failed to create creator profile',
        details: profileError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Creator registered successfully',
      userId: newUser.user_id
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
