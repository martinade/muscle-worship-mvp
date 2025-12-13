import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const LEGAL_DISCLAIMER = `
CREATOR TAX RESPONSIBILITY NOTICE

As an independent contractor on Muscle Worship, you understand and agree that:

1. TAX OBLIGATIONS
   - You are responsible for reporting your earnings to tax authorities in your jurisdiction
   - You are responsible for paying all applicable income taxes, self-employment taxes, and VAT/GST
   - Muscle Worship does not withhold taxes from your earnings
   - You should consult a tax professional for guidance specific to your situation

2. TAX DOCUMENTATION
   - Muscle Worship will provide annual earnings statements
   - US creators earning ≥$600/year will receive IRS Form 1099-NEC
   - Non-US creators must complete Form W-8BEN
   - You are responsible for keeping accurate records

3. PLATFORM TERMS
   - Muscle Worship does NOT provide tax advice
   - Muscle Worship does NOT guarantee compliance with your local tax laws
   - You agree to indemnify Muscle Worship against any tax-related claims

4. DATA COLLECTION
   - We collect tax identification information (SSN/EIN for US, tax ID for international)
   - This information is stored securely and used only for tax reporting
   - We will not share your tax information except as required by law

BY CHECKING THIS BOX, you acknowledge that you have read, understood, and agree to these terms. You confirm that you are responsible for your own tax obligations and will not hold Muscle Worship liable for any tax issues.

☐ I ACCEPT these terms and understand my tax responsibilities

Date: [Auto-filled]
IP Address: [Auto-captured]
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('role')
      .eq('user_id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can accept legal disclaimer' });
    }

    const { disclaimer_version } = req.body;

    if (!disclaimer_version) {
      return res.status(400).json({ error: 'disclaimer_version is required' });
    }

    const ipAddress = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    const acceptedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('creatorprofiles')
      .update({
        legal_disclaimer_accepted: true,
        legal_disclaimer_accepted_at: acceptedAt,
        ip_address_at_acceptance: ipAddress,
      })
      .eq('user_id', decoded.userId);

    if (updateError) {
      return res.status(500).json({ error: `Failed to update disclaimer acceptance: ${updateError.message}` });
    }

    return res.status(200).json({
      success: true,
      accepted_at: acceptedAt,
      disclaimer_version,
      ip_address: ipAddress,
    });
  } catch (error: any) {
    console.error('Legal disclaimer acceptance error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
