const nodemailer = require('nodemailer');

/**
 * Reusable email service supporting SMTP transport with safe local development fallback
 */
const sendPasswordResetEmail = async ({ to, fullName, resetToken }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || 'academia@netcradus.com';

  const isConfigured = host && port && user && pass;

  // Development Fallback: If SMTP credentials are missing/unconfigured
  if (!isConfigured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP configuration missing in production environment.');
    }

    // ONLY in non-production environments: log the full reset link for local testing
    console.log('\n======================================================');
    console.log('[LOCAL DEV EMAIL SERVICE] Password Reset Link:');
    console.log(`To: ${to}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('======================================================\n');
    return { success: true, mode: 'development_console' };
  }

  // Production/Configured SMTP Transporter
  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - Netcradus Academy</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 580px; margin: 0 auto; background: #131b2e; border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 12px; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; }
          .header h1 { color: #00d2ff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
          .header p { color: #94a3b8; font-size: 14px; margin-top: 4px; }
          .content { line-height: 1.6; font-size: 15px; color: #cbd5e1; }
          .btn-wrapper { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #00d2ff 0%, #0077ff 100%); color: #0b0f19 !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-size: 15px; }
          .footer { margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; font-size: 13px; color: #64748b; line-height: 1.5; }
          .warning { background: rgba(255, 171, 0, 0.1); border-left: 4px solid #ffab00; padding: 12px; border-radius: 4px; font-size: 13px; color: #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NETCRADUS ACADEMY</h1>
            <p>Empowering the Next Generation of Tech Leaders</p>
          </div>
          <div class="content">
            <p>Hello ${fullName || 'Student'},</p>
            <p>We received a request to reset the password for your Netcradus Academy account. Click the button below to choose a new password:</p>
            
            <div class="btn-wrapper">
              <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
            </div>

            <div class="warning">
              <strong>Notice:</strong> This password reset link is valid for <strong>15 minutes</strong> only.
            </div>

            <p>If you did not request a password reset, no further action is required. Your password remains completely secure.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Netcradus Academy. All rights reserved.<br>If the button above does not work, copy and paste this URL into your browser:<br><span style="color: #00d2ff; word-break: break-all;">${resetUrl}</span></p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Netcradus Academy" <${from}>`,
    to,
    subject: 'Password Reset Request - Netcradus Academy',
    html: htmlContent,
  });

  return { success: true, mode: 'smtp' };
};

module.exports = {
  sendPasswordResetEmail,
};
