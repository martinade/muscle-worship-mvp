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
      return res.status(403).json({ error: 'Only creators can upload videos' });
    }

    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
      filter: (part) => {
        return part.mimetype?.includes('video') || false;
      },
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'File upload failed' });
      }

      const fileArray = files.video;
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
      if (!allowedTypes.includes(file.mimetype || '')) {
        return res.status(400).json({ error: 'Invalid file type. Only MP4, MOV, WEBM, and AVI allowed' });
      }

      const { data: profile, error: profileError } = await supabase
        .from('creatorprofiles')
        .select('promo_videos')
        .eq('user_id', decoded.userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      const currentVideos = profile?.promo_videos || [];

      if (currentVideos.length >= 2) {
        return res.status(400).json({ error: 'Maximum 2 videos allowed' });
      }

      const fileBuffer = fs.readFileSync(file.filepath);
      const fileName = `${decoded.userId}/${Date.now()}-${file.originalFilename}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creator-videos')
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype || 'video/mp4',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload video to storage' });
      }

      const { data: urlData } = supabase.storage
        .from('creator-videos')
        .getPublicUrl(fileName);

      const videoUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('creatorprofiles')
        .update({
          promo_videos: [...currentVideos, videoUrl],
        })
        .eq('user_id', decoded.userId);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update profile with video URL' });
      }

      fs.unlinkSync(file.filepath);

      return res.status(200).json({
        success: true,
        video_url: videoUrl,
        total_videos: currentVideos.length + 1,
      });
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
