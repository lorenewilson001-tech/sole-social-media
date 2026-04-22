interface EmailParams {
  to: string | string[];
  subject: string;
  message: string;
  bcc?: string | string[];
  title?: string;
  actionLabel?: string;
  actionUrl?: string;
  imageUrl?: string;
  caption?: string;
  variant?: 'creator' | 'client';
}

const getEmailTemplate = (title: string, message: string, params: Partial<EmailParams>) => {
  const { actionLabel, actionUrl, imageUrl, caption, variant = 'creator' } = params;
  
  // Color configuration based on sender
  const isCreatorEmail = variant === 'creator';
  const headerBg = isCreatorEmail ? '#8b1d1d' : '#a68a56'; // Red for Jannat, Gold for Client
  const accentColor = isCreatorEmail ? '#a68a56' : '#8b1d1d';
  const buttonBg = isCreatorEmail ? '#8b1d1d' : '#a68a56';
  const headerText = isCreatorEmail ? 'Email From Jannat' : 'Client Feedback';

  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #120e0b; border: 1px solid ${accentColor}; border-radius: 16px; overflow: hidden; color: #ffffff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <div style="background-color: ${headerBg}; padding: 30px; text-align: center; border-bottom: 2px solid ${accentColor};">
        <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff;">${headerText}</h1>
      </div>
      
      <div style="padding: 40px 30px; background-color: #1c1514;">
        <h2 style="margin-top: 0; color: ${accentColor}; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${title}</h2>
        <div style="height: 2px; width: 40px; background-color: ${headerBg}; margin-bottom: 24px;"></div>
        
        <p style="color: #d1d5db; line-height: 1.8; font-size: 15px; white-space: pre-wrap; margin-bottom: 32px;">${message}</p>

        ${imageUrl || caption ? `
          <div style="background-color: #120e0b; border: 1px solid rgba(166, 138, 86, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <p style="margin-top: 0; font-size: 10px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Reference Content:</p>
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              ${imageUrl ? `
                <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; background-color: #000; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1);">
                  <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail" />
                </div>
              ` : ''}
              <div style="flex: 1;">
                <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5; font-style: italic;">
                  ${caption ? `"${caption}"` : 'Image Attachment'}
                </p>
              </div>
            </div>
          </div>
        ` : ''}

        ${actionUrl && actionLabel ? `
          <div style="text-align: center;">
            <a href="${actionUrl}" style="background-color: ${buttonBg}; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 13px; display: inline-block; border: 1px solid rgba(166, 138, 86, 0.3);">${actionLabel}</a>
          </div>
        ` : ''}
      </div>

      <div style="padding: 20px; background-color: #120e0b; text-align: center; font-size: 12px; color: ${accentColor}; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-top: 1px solid rgba(166, 138, 86, 0.2);">
        Social Media Marketing
      </div>
    </div>
  `;
};

export const sendAutomatedEmail = async (params: EmailParams) => {
  const { to, subject, message, bcc, title, variant, actionLabel, actionUrl, imageUrl, caption } = params;
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
        html: getEmailTemplate(title || subject, message, { actionLabel, actionUrl, imageUrl, caption, variant }),
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
