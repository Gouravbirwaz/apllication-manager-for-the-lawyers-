import { AuthFormWrapper } from '@/components/auth/auth-form-wrapper';
import { SignUpForm } from '@/components/auth/signup-form';

export default function SignUpPage() {
  return (
    <AuthFormWrapper
      title="Create an Account"
      description="Join Nyayadeep to streamline your legal work."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      <SignUpForm />
    </AuthFormWrapper>
  );
}
