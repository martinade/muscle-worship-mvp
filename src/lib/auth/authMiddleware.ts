import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { verifyToken, generateAccessToken } from '@/lib/auth/tokenUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    role: string;
  };
}

type NextApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Authentication middleware for API routes
 * @param allowedRoles - Optional array of roles that are allowed to access the route
 * @returns Middleware function that wraps the API handler
 */
export function requireAuth(allowedRoles?: string[]) {
  return (handler: NextApiHandler) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      try {
        // Read accessToken from cookies
        let accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        // Verify access token
        let decoded = accessToken ? verifyToken(accessToken, 'access') : null;

        // If access token expired but refresh token exists, try to refresh
        if (!decoded && refreshToken) {
          const refreshDecoded = verifyToken(refreshToken, 'refresh');

          if (refreshDecoded && refreshDecoded.userId) {
            // Fetch user role from database
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('role')
              .eq('user_id', refreshDecoded.userId)
              .single();

            if (!userError && user) {
              // Generate new access token
              const newAccessToken = generateAccessToken({
                userId: refreshDecoded.userId,
                role: user.role,
              });

              // Set new accessToken cookie
              const isProduction = process.env.NODE_ENV === 'production';
              res.setHeader(
                'Set-Cookie',
                `accessToken=${newAccessToken}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=${15 * 60}`
              );

              // Update decoded with new token data
              decoded = {
                userId: refreshDecoded.userId,
                role: user.role,
              };
            }
          }
        }

        // If no valid token, return 401 Unauthorized
        if (!decoded || !decoded.userId) {
          return res.status(401).json({
            error: 'Unauthorized',
            details: 'Authentication required',
          });
        }

        // Check if user role is in allowedRoles
        if (allowedRoles && allowedRoles.length > 0) {
          if (!decoded.role || !allowedRoles.includes(decoded.role)) {
            return res.status(403).json({
              error: 'Forbidden',
              details: 'You do not have permission to access this resource',
            });
          }
        }

        // Attach user data to request object
        req.user = {
          userId: decoded.userId,
          role: decoded.role || '',
        };

        // Call the actual handler
        return handler(req, res);
      } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };
  };
}
