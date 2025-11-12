import { AuthFormWrapper } from '@/components/auth/auth-form-wrapper';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthFormWrapper
      title="Forgot Your Password?"
      description="Enter your email to receive a one-time password (OTP)."
      footerText="Remember your password?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      <ForgotPasswordForm />
    </AuthFormWrapper>
  );
}
