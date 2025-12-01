import type { NextApiRequest, NextApiResponse } from 'next';

interface SuccessResponse {
  success: true;
  message: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear accessToken and refreshToken cookies
    res.setHeader('Set-Cookie', [
      `accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
      `refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
    ]);

    // TODO V1.1: Blacklist refresh token in database

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}
