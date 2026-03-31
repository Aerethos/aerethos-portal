import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'profile' | 'memory';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Invalid file type. JPG, PNG, HEIC or WebP only.' }, { status: 400 });

    const bucket = type === 'profile' ? 'profile-photos' : 'memory-photos';
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
