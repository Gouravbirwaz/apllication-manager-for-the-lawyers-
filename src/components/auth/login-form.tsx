
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`;
    const response = await fetch(usersApiUrl, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });
    if (response.ok) {
      const users: User[] = await response.json();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return foundUser || null;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return null;
  }
}

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

      if (loginResponse.ok) {
        // Login successful, now fetch user details to get the ID
        const userData = await getUserByEmail(email);

        if (userData && userData.id) {
            toast({
              title: 'Login Successful',
              description: 'Welcome back!',
            });
            
            // Store user ID in session storage to persist login state
            sessionStorage.setItem('userId', String(userData.id));
            
            // Redirect to dashboard
            router.push('/dashboard');
        } else {
            throw new Error('Login succeeded but failed to retrieve user details.');
        }

      } else {
        const loginData = await loginResponse.json();
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
