import nodemailer from 'nodemailer';

let testSink = null;

export const setEmailTestSink = (sink) => {
  testSink = sink;
};

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Password reset email delivery is not configured');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendPasswordResetEmail({ to, resetUrl }) {
  if (process.env.NODE_ENV === 'test' && testSink) {
    await testSink({ to, resetUrl });
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'Reset your Gene\'s InDrive password',
    text: `Use this link to reset your password. It expires in 15 minutes:\n\n${resetUrl}`,
    html: `<p>Use the button below to reset your password. This link expires in 15 minutes.</p><p><a href="${resetUrl}">Reset password</a></p>`,
  });
}
