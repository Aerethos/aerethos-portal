import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// ── Browser client (used in components) ──────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Server client (used in API routes — has full access) ─────────────────────
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ── Auth helpers ──────────────────────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getStudent(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('*, schools(*)')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function getSubmission(studentId: string) {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('*')
    .eq('student_id', studentId)
    .single();
  if (error) return null;
  return data;
}

export async function upsertSubmission(
  studentId: string,
  schoolId: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .upsert(
      {
        student_id: studentId,
        school_id: schoolId,
        updated_at: new Date().toISOString(),
        ...updates,
      },
      { onConflict: 'student_id' }
    )
    .select()
    .single();
  return { data, error };
}

// ── Storage helpers ───────────────────────────────────────────────────────────
export async function uploadFile(
  bucket: 'profile-photos' | 'memory-photos',
  path: string,
  file: File
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) { console.error('Upload error:', error); return null; }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
