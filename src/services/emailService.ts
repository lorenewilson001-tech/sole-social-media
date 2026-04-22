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
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #120e0b; border: 1px solid #a68a56; border-radius: 16px; overflow: hidden; color: #ffffff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <div style="background-color: #8b1d1d; padding: 30px; text-align: center; border-bottom: 2px solid #a68a56;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff;">Email From Jannat</h1>
      </div>
      <div style="padding: 40px 30px; background-color: #1c1514;">
        <h2 style="margin-top: 0; color: #a68a56; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${title}</h2>
        <div style="height: 2px; width: 40px; background-color: #8b1d1d; margin-bottom: 24px;"></div>
        <p style="color: #d1d5db; line-height: 1.8; font-size: 15px; white-space: pre-wrap; margin-bottom: 32px;">${message}</p>
        ${actionUrl && actionLabel ? `
          <div style="text-align: center;">
            <a href="${actionUrl}" style="background-color: #8b1d1d; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 13px; display: inline-block; border: 1px solid rgba(166, 138, 86, 0.3);">${actionLabel}</a>
          </div>
        ` : ''}
      </div>
      <div style="padding: 20px; background-color: #120e0b; text-align: center; font-size: 12px; color: #a68a56; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-top: 1px solid rgba(166, 138, 86, 0.2);">
        Social Media Marketing
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
