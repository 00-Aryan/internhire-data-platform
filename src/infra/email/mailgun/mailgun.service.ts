import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { render } from '@react-email/render';
import VerificationEmail from '../template/VerificationEmail';


if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN || !process.env.EMAIL_FROM) {
  throw new Error('Mailgun email configuration is missing');
}
 
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
});

const FROM_EMAIL = process.env.EMAIL_FROM!;
const DOMAIN = process.env.MAILGUN_DOMAIN!;

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  try {
    const html: string = await render(
  VerificationEmail({ name, confirmLink })
);



    await mg.messages.create(DOMAIN, {
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email for InternHire',
      html,
    });

    console.log('Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  try {
    await mg.messages.create(DOMAIN, {
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you didn’t request this, you can ignore this email.</p>
      `,
    });

    console.log('Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
};
