import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Simple admin key check — in production use proper admin auth
function isAdmin(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const schoolId = req.nextUrl.searchParams.get('school_id');
  const status = req.nextUrl.searchParams.get('status');

  let query = supabaseAdmin
    .from('submissions')
    .select(`
      *,
      students (
        full_name,
        email,
        student_id,
        class_label
      ),
      schools (
        name,
        year,
        deadline
      )
    `)
    .order('updated_at', { ascending: false });

  if (schoolId) query = query.eq('school_id', schoolId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ submissions: data });
}

// Update submission status (approve / request changes)
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { submissionId, status, adminNotes } = await req.json();

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .update({
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submission: data });
}
