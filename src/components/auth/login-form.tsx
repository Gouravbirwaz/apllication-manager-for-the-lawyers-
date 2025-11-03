
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const loginApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`;
      const loginResponse = await fetch(loginApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        toast({
          title: 'Login Successful',
          description: 'Fetching your details...',
        });

        // After successful login, fetch the user's full details using their email.
        // This assumes an endpoint exists to get a user by their email.
        const userApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/get/user_by_email/${email}`;
        const userResponse = await fetch(userApiUrl, {
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData && userData.id) {
             // Store user ID in session storage to persist login state
            sessionStorage.setItem('userId', userData.id);
            // Redirect to dashboard after successfully getting user details
             setTimeout(() => router.push('/dashboard'), 500);
          } else {
             throw new Error('Could not retrieve user details after login.');
          }
        } else {
           throw new Error('Failed to fetch user details after successful login.');
        }

      } else {
        toast({
          title: 'Login Failed',
          description: loginData.error || 'Invalid credentials.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
            Forgot your password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSignIn();
            }
          }}
          disabled={isLoading}
          suppressHydrationWarning
        />
      </div>
      <Button onClick={handleSignIn} disabled={isLoading} className="w-full" suppressHydrationWarning>
        {isLoading ? 'Logging In...' : 'Login'}
      </Button>
    </div>
  );
}
