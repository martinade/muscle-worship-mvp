import jwt from 'jsonwebtoken';

/**
 * Generate an access token with 15 minute expiry
 * @param payload - Object containing userId and role
 * @returns JWT access token
 */
export function generateAccessToken(payload: { userId: string; role: string }): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }

  const token = jwt.sign(
    { userId: payload.userId, role: payload.role },
    secret,
    { expiresIn: '15m' }
  );

  return token;
}

/**
 * Generate a refresh token with 7 day expiry
 * @param payload - Object containing userId
 * @returns JWT refresh token
 */
export function generateRefreshToken(payload: { userId: string }): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  const token = jwt.sign(
    { userId: payload.userId },
    secret,
    { expiresIn: '7d' }
  );

  return token;
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @param type - Token type ('access' or 'refresh')
 * @returns Decoded token payload with userId and optionally role, or null if invalid
 */
export function verifyToken(token: string, type: 'access' | 'refresh' = 'access'): { userId: string; role?: string } | null {
  try {
    const secret = type === 'access' 
      ? process.env.JWT_ACCESS_SECRET 
      : process.env.JWT_REFRESH_SECRET;
    
    if (!secret) {
      throw new Error(`JWT_${type.toUpperCase()}_SECRET is not defined`);
    }

    const decoded = jwt.verify(token, secret) as { userId: string; role?: string };
    return decoded;
  } catch (error) {
    return null;
  }
}
