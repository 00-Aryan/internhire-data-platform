import { Resend } from 'resend';
import VerificationEmail from './template/VerificationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  // UNCOMMENT TO TEST ROLLBACK:
  // return { success: false, error: new Error("Simulated Email Failure") };

  try {
    await resend.emails.send({
      // from: 'InternHire <onboarding@resend.dev>',
      from: 'InternHire <support@internhire.in>',
      to: email,
      subject: 'Verify your email for InternHire',
      react: VerificationEmail({ name, confirmLink }),
    });
    console.log('Verification email sent successfully to:', email);
    return { success: true };
  } catch (error: any) {
    // In development, if we hit the Resend sandbox limit, log the link and proceed
    if (process.env.NODE_ENV !== 'production' && error?.name === 'validation_error') {
      console.log('----------------------------------------------------------');
      console.log('⚠️ RESEND SANDBOX: Email could not be sent to', email);
      console.log('🔗 CLICK THIS LINK TO VERIFY:', confirmLink);
      console.log('----------------------------------------------------------');
      return { success: true };
    }

    console.error("Failed to send email:", error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'InternHire <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    console.log('Password reset email sent successfully to:', email);
    return { success: true };
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production' && error?.name === 'validation_error') {
      console.log('----------------------------------------------------------');
      console.log('⚠️ RESEND SANDBOX: Email could not be sent to', email);
      console.log('🔗 CLICK THIS LINK TO RESET PASSWORD:', resetLink);
      console.log('----------------------------------------------------------');
      return { success: true };
    }
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
};
