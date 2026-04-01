import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, upsertSubmission } from '@/lib/supabase';
import { sendSubmissionConfirmation, sendAdminNotification } from '@/lib/email';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET — load existing submission
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('student_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submission: data ?? null });
  } catch (err) {
    console.error('GET submission error:', err);
    return NextResponse.json({ submission: null });
  }
}

// PATCH — save step progress
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: student } = await supabaseAdmin
      .from('students')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const updates = await req.json();

    const { data, error } = await upsertSubmission(user.id, student.school_id, {
      ...updates,
      status: 'in_progress',
    });

    if (error) {
      console.error('Save error:', error);
      return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (err) {
    console.error('PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — final submission
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: student } = await supabaseAdmin
      .from('students')
      .select('*, schools(*)')
      .eq('id', user.id)
      .single();

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const body = await req.json();

    const { data, error } = await upsertSubmission(student.id, student.school_id, {
      ...body,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Submission error:', error);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    await Promise.allSettled([
      sendSubmissionConfirmation(
        student.email,
        student.full_name,
        student.schools.name,
        student.schools.deadline
      ),
      sendAdminNotification(
        student.full_name,
        student.schools.name,
        student.email
      ),
    ]);

    return NextResponse.json({ success: true, submission: data });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
