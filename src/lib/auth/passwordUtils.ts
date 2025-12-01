import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt with 12 rounds
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

/**
 * Verify a password against a bcrypt hash
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const isValid = await bcrypt.compare(password, hash);
  return isValid;
}
