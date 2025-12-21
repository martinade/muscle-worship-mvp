import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';
import formidable from 'formidable';
import fs from 'fs';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid authorization' });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can submit tax forms' });
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024,
      filter: (part) => {
        return part.mimetype?.includes('pdf') || false;
      },
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'File upload failed' });
      }

      const fileArray = files.tax_form;
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Invalid file type. Only PDF allowed' });
      }

      const formTypeArray = fields.form_type;
      const formType = Array.isArray(formTypeArray) ? formTypeArray[0] : formTypeArray;

      if (!formType || !['W9', 'W8BEN'].includes(formType)) {
        return res.status(400).json({ error: 'Invalid form_type. Must be W9 or W8BEN' });
      }

      const taxIdLastFourArray = fields.tax_id_last_four;
      const taxIdLastFour = Array.isArray(taxIdLastFourArray) ? taxIdLastFourArray[0] : taxIdLastFourArray;

      if (!taxIdLastFour || !/^\d{4}$/.test(taxIdLastFour)) {
        return res.status(400).json({ error: 'Invalid tax_id_last_four. Must be 4 digits' });
      }

      const fileBuffer = fs.readFileSync(file.filepath);
      const fileName = `${decoded.userId}/${Date.now()}-${formType}.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tax-forms')
        .upload(fileName, fileBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload tax form to storage' });
      }

      const { data: urlData } = supabase.storage
        .from('tax-forms')
        .getPublicUrl(fileName);

      const taxFormUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('creatorprofiles')
        .update({
          tax_form_type: formType,
          tax_form_url: taxFormUrl,
          tax_id_last_four: taxIdLastFour,
        })
        .eq('user_id', decoded.userId);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update profile with tax form' });
      }

      fs.unlinkSync(file.filepath);

      return res.status(200).json({
        success: true,
        message: 'Tax form submitted successfully',
      });
    });
  } catch (error: any) {
    console.error('Tax form submission error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
