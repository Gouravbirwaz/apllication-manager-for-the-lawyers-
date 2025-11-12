'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function SignUpForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !phoneNumber) {
      toast({
        title: 'Error',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    // Use FormData to handle file upload along with other data
    const formData = new FormData();
    formData.append('name', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone_number', phoneNumber);
    if (profilePic) {
      formData.append('photo', profilePic);
    }
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/signup`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          // 'Content-Type' is not set, browser will set it to 'multipart/form-data'
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Account created successfully.',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Signup Failed',
          description: data.error || 'Could not create account.',
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

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input
          id="full-name"
          placeholder="Aditi Sharma"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          suppressHydrationWarning
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="a.sharma@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          suppressHydrationWarning
        />
      </div>
       <div className="grid gap-2">
        <Label htmlFor="phone-number">Phone Number</Label>
        <Input
          id="phone-number"
          placeholder="9876543210"
          required
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isLoading}
          suppressHydrationWarning
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          suppressHydrationWarning
        />
      </div>
       <div className="grid gap-2">
        <Label htmlFor="profile-pic">Profile Picture (Optional)</Label>
        <Input
          id="profile-pic"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="file:text-primary file:font-medium"
          suppressHydrationWarning
        />
      </div>
      <Button onClick={handleSignUp} disabled={isLoading} type="submit" className="w-full" suppressHydrationWarning>
        {isLoading ? 'Creating Account...' : 'Create an account'}
      </Button>
    </div>
  );
}
