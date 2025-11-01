import { AuthFormWrapper } from '@/components/auth/auth-form-wrapper';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthFormWrapper
      title="Welcome Back"
      description="Sign in to access your dashboard."
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Sign Up"
    >
      <LoginForm />
    </AuthFormWrapper>
  );
}
