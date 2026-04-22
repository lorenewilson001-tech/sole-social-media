interface EmailParams {
  to: string | string[];
  subject: string;
  message: string;
  bcc?: string | string[];
}

export const sendAutomatedEmail = async ({ to, subject, message, bcc }: EmailParams) => {
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
        html: message.replace(/\n/g, '<br>'),
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
