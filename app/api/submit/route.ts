import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, upsertSubmission } from '@/lib/supabase';
import { sendSubmissionConfirmation, sendAdminNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Verify auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Get student record
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('*, schools(*)')
      .eq('id', user.id)
      .single();

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const body = await req.json();

    // Save to Supabase
    const { data, error } = await upsertSubmission(student.id, student.school_id, {
      ...body,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Submission error:', error);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    // Send emails
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

// Save progress (auto-save on each step)
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

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

    if (error) return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    return NextResponse.json({ success: true, submission: data });
  } catch (err) {
    console.error('Save error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
