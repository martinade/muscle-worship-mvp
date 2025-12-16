import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { verifyAccessToken } from '@/lib/auth/tokenUtils';
import formidable from 'formidable';
import fs from 'fs';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
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
      .from('users')
      .select('role')
      .eq('user_id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can upload photos' });
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024,
      filter: (part) => {
        return part.mimetype?.includes('image') || false;
      },
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'File upload failed' });
      }

      const fileArray = files.photo;
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype || '')) {
        return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG, and WEBP allowed' });
      }

      const { data: profile, error: profileError } = await supabase
        .from('creatorprofiles')
        .select('profile_photos')
        .eq('user_id', decoded.userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      const currentPhotos = profile?.profile_photos || [];

      if (currentPhotos.length >= 10) {
        return res.status(400).json({ error: 'Maximum 10 photos allowed' });
      }

      const fileBuffer = fs.readFileSync(file.filepath);
      const fileName = `${decoded.userId}/${Date.now()}-${file.originalFilename}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creator-photos')
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload photo to storage' });
      }

      const { data: urlData } = supabase.storage
        .from('creator-photos')
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('creatorprofiles')
        .update({
          profile_photos: [...currentPhotos, photoUrl],
        })
        .eq('user_id', decoded.userId);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update profile with photo URL' });
      }

      fs.unlinkSync(file.filepath);

      return res.status(200).json({
        success: true,
        photo_url: photoUrl,
        total_photos: currentPhotos.length + 1,
      });
    });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
