import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface RequestBody {
  email: string;
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
    const { email }: RequestBody = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing required field',
        details: 'Email is required',
      });
    }

    // Query Users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, email, username')
      .eq('email', email)
      .single();

    // Always return success to prevent email enumeration
    if (userError || !user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a reset link has been sent',
      });
    }

    // Generate reset token (random 32-byte hex)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: expiresAt.toISOString(),
      })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('Failed to store reset token:', updateError);
      return res.status(500).json({
        error: 'Failed to process request',
      });
    }

    // Send email with SendGrid
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendGridApiKey) {
      console.error('SENDGRID_API_KEY not configured');
      return res.status(500).json({
        error: 'Email service not configured',
      });
    }

    const resetLink = `https://muscleworship.com/reset-password?token=${resetToken}`;

    const emailData = {
      personalizations: [
        {
          to: [{ email: user.email }],
          subject: 'Password Reset Request',
        },
      ],
      from: { email: 'noreply@muscleworship.com', name: 'Muscle Worship' },
      content: [
        {
          type: 'text/html',
          value: `
            <h2>Password Reset Request</h2>
            <p>Hi ${user.username},</p>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Muscle Worship Team</p>
          `,
        },
      ],
    };

    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sendGridApiKey}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!emailResponse.ok) {
      console.error('SendGrid error:', await emailResponse.text());
      return res.status(500).json({
        error: 'Failed to send email',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent',
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
