'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

type FormStep = 'enter-email' | 'verify-otp' | 'success';

export function ForgotPasswordForm() {
  const [step, setStep] = useState<FormStep>('enter-email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/forgot-password`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'OTP Sent',
          description: data.message || 'An OTP has been sent to your email.',
        });
        setServerOtp(data.otp);
        setStep('verify-otp');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Could not process request.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp !== serverOtp) {
      toast({
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!newPassword) {
      toast({
        title: 'Error',
        description: 'Please enter a new password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/update-password`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating the password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (step === 'success') {
    return (
        <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Password Reset Successful!</h2>
            <p className="text-muted-foreground text-sm">You can now log in with your new password. Redirecting to login...</p>
        </div>
    );
  }

  if (step === 'verify-otp') {
    return (
      <div className="grid gap-4">
        <p className="text-center text-sm text-muted-foreground">
          An OTP has been sent to <strong>{email}</strong>.
        </p>
        <div className="grid gap-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <Input
            id="otp"
            type="text"
            placeholder="123456"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
            suppressHydrationWarning
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            suppressHydrationWarning
          />
        </div>
        <Button onClick={handleResetPassword} disabled={isLoading} className="w-full" suppressHydrationWarning>
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          suppressHydrationWarning
        />
      </div>
      <Button onClick={handleSendOtp} disabled={isLoading} className="w-full" suppressHydrationWarning>
        {isLoading ? 'Sending...' : 'Send OTP'}
      </Button>
    </div>
  );
}
