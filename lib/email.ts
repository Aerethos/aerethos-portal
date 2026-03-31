import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendSubmissionConfirmation(
  studentEmail: string,
  studentName: string,
  schoolName: string,
  deadline: string
) {
  await resend.emails.send({
    from: 'AerEthos <portal@aerethos.com>',
    to: studentEmail,
    subject: `Your yearbook submission is in — ${schoolName}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;color:#003566;">
        <div style="padding:32px 0;border-bottom:1px solid rgba(0,53,102,0.1);">
          <span style="font-family:Georgia,serif;font-size:24px;font-weight:600;letter-spacing:0.05em;">AerEthos</span>
        </div>
        <div style="padding:40px 0;">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:300;margin:0 0 16px;">
            Submission received, ${studentName.split(' ')[0]}.
          </h1>
          <p style="font-size:15px;line-height:1.8;opacity:0.7;margin:0 0 24px;">
            We've got everything we need for your ${schoolName} yearbook page. 
            Our design team will now build your page and send you a proof to review.
          </p>
          <div style="padding:20px 24px;border-left:3px solid #B08A4A;background:rgba(176,138,74,0.06);margin-bottom:32px;">
            <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#B08A4A;margin-bottom:8px;">Submission deadline</div>
            <div style="font-family:Georgia,serif;font-size:20px;font-weight:300;">${deadline}</div>
            <div style="font-size:12px;opacity:0.5;margin-top:4px;">You can still edit your submission until this date.</div>
          </div>
          <p style="font-size:13px;opacity:0.5;line-height:1.7;">
            Questions? Reply to this email or contact 
            <a href="mailto:nathan@aerethos.com" style="color:#B08A4A;">nathan@aerethos.com</a>
          </p>
        </div>
        <div style="padding:20px 0;border-top:1px solid rgba(0,53,102,0.08);font-size:11px;opacity:0.35;">
          AerEthos · Ireland's memory publishing platform · aerethos.com
        </div>
      </div>
    `,
  });
}

export async function sendAdminNotification(
  studentName: string,
  schoolName: string,
  studentEmail: string
) {
  await resend.emails.send({
    from: 'AerEthos Portal <portal@aerethos.com>',
    to: 'nathan@aerethos.com',
    subject: `New submission — ${studentName} · ${schoolName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;color:#003566;">
        <h2 style="margin:0 0 16px;">New yearbook submission</h2>
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Email:</strong> ${studentEmail}</p>
        <p><strong>School:</strong> ${schoolName}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('en-IE')}</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" 
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#003566;color:white;text-decoration:none;font-size:13px;">
          View in Admin →
        </a>
      </div>
    `,
  });
}
