import nodemailer from 'nodemailer';

// Create transporter for Maileroo SMTP
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.maileroo.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (!smtpUser || !smtpPassword) {
    throw new Error('SMTP credentials are not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Maileroo SMTP
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  try {
    const transporter = createTransporter();
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_EMAIL || process.env.SMTP_USER || 'noreply@kissblow.me';

    const mailOptions = {
      from: `"KissBlow" <${fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Plain text version (strip HTML tags)
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string): Promise<void> {
  const appName = 'KissBlow';
  const subject = 'Reset Your Password';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
          <h1 style="color: #00AFF0; margin-top: 0;">Reset Your Password</h1>
          
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          
          <p>We received a request to reset your password for your ${appName} account. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #00AFF0; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; background-color: #f1f1f1; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; margin-bottom: 0;">
            Best regards,<br>
            The ${appName} Team
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Send contact/DMCA form email to info@kissblow.me
 */
export async function sendContactEmail(data: {
  name: string;
  email: string;
  category: string;
  urls?: string;
  message: string;
}): Promise<void> {
  const recipientEmail = process.env.CONTACT_EMAIL || 'info@kissblow.me';
  
  // Map category values to readable labels
  const categoryLabels: Record<string, string> = {
    copyright: 'Copyright Infringement',
    privacy: 'Privacy concerns',
    impersonation: 'Impersonation or fake profiles',
    underage: 'Underage content concerns',
    other: 'Other violations of our Terms of Use',
  };
  
  const categoryLabel = categoryLabels[data.category] || data.category;
  
  // Escape user input to prevent XSS
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br>');
  
  const subject = `[Contact/DMCA] ${categoryLabel} - ${safeName}`;
  
  // Process URLs safely
  let urlsHtml = '';
  if (data.urls && data.urls.trim()) {
    const urlList = data.urls.split(/\s+/)
      .map(url => url.trim())
      .filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));
    
    if (urlList.length > 0) {
      urlsHtml = `
          <div style="margin-top: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">URLs:</h2>
            <div style="background-color: #f1f1f1; padding: 10px; border-radius: 4px; margin: 0; word-break: break-all;">
              ${urlList.map(url => 
                `<a href="${escapeHtml(url)}" target="_blank" style="color: #00AFF0; display: block; margin-bottom: 5px;">${escapeHtml(url)}</a>`
              ).join('')}
            </div>
          </div>
      `;
    }
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact / DMCA Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
          <h1 style="color: #00AFF0; margin-top: 0; border-bottom: 2px solid #00AFF0; padding-bottom: 10px;">
            Contact / DMCA Form Submission
          </h1>
          
          <div style="margin-top: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">Category:</h2>
            <p style="background-color: #e3f2fd; padding: 10px; border-radius: 4px; margin: 0;">
              <strong>${escapeHtml(categoryLabel)}</strong>
            </p>
          </div>
          
          <div style="margin-top: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">From:</h2>
            <p style="background-color: #f1f1f1; padding: 10px; border-radius: 4px; margin: 0;">
              <strong>Name:</strong> ${safeName}<br>
              <strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a>
            </p>
          </div>
          
          ${urlsHtml}
          
          <div style="margin-top: 20px;">
            <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">Message:</h2>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #ddd; white-space: pre-wrap;">
              ${safeMessage}
            </div>
          </div>
          
          <hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; margin-bottom: 0;">
            <strong>Submitted:</strong> ${new Date().toLocaleString('en-US', { 
              dateStyle: 'long', 
              timeStyle: 'short',
              timeZone: 'UTC'
            })} UTC<br>
            <strong>Reply to:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a>
          </p>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Contact / DMCA Form Submission

Category: ${categoryLabel}

From:
Name: ${data.name}
Email: ${data.email}

${data.urls ? `URLs:\n${data.urls}\n\n` : ''}Message:
${data.message}

---
Submitted: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' })} UTC
Reply to: ${data.email}
  `.trim();

  await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
  });
  
  // Also send a confirmation email to the user
  const userConfirmationHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
          <h1 style="color: #00AFF0; margin-top: 0;">Message Received</h1>
          
          <p>Hello ${escapeHtml(data.name)},</p>
          
          <p>Thank you for contacting KissBlow. We have received your message regarding <strong>${escapeHtml(categoryLabel)}</strong> and will review it shortly.</p>
          
          <p>We typically respond to inquiries within 24-48 hours. For urgent matters, we may respond sooner.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; margin-bottom: 0;">
            Best regards,<br>
            The KissBlow Team<br>
            <a href="mailto:info@kissblow.me">info@kissblow.me</a>
          </p>
        </div>
      </body>
    </html>
  `;
  
  try {
    await sendEmail({
      to: data.email,
      subject: 'We received your message - KissBlow',
      html: userConfirmationHtml,
    });
  } catch (error) {
    // Don't fail the main email send if confirmation fails
    console.error('Failed to send confirmation email:', error);
  }
}

