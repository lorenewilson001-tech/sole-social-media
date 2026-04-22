interface EmailParams {
  to: string | string[];
  subject: string;
  message: string;
  bcc?: string | string[];
  title?: string;
  actionLabel?: string;
  actionUrl?: string;
}

const getEmailTemplate = (title: string, message: string, actionLabel?: string, actionUrl?: string) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; color: #f8fafc;">
      <div style="background-color: #ef4444; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff;">Sole Social</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="margin-top: 0; color: #ffffff; font-size: 18px; font-weight: 700;">${title}</h2>
        <p style="color: #94a3b8; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${message}</p>
        ${actionUrl && actionLabel ? `
          <div style="margin-top: 32px; text-align: center;">
            <a href="${actionUrl}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; display: inline-block;">${actionLabel}</a>
          </div>
        ` : ''}
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
        &copy; ${new Date().getFullYear()} The Sole Ingredient Catering LLC. All rights reserved.
      </div>
    </div>
  `;
};

export const sendAutomatedEmail = async ({ to, subject, message, bcc, title, actionLabel, actionUrl }: EmailParams) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        text: message,
        html: getEmailTemplate(title || subject, message, actionLabel, actionUrl),
        bcc
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    return result;
  } catch (error) {
    console.error('Email Notification Error:', error);
    // If it's a key missing error, alert the user
    if (error instanceof Error && error.message.includes('API key')) {
      alert('Email could not be sent automatically because RESEND_API_KEY is not configured in Secrets.');
    }
    throw error;
  }
};
