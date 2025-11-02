'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import type { User } from '@/lib/types';


export function TeamActivity() {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/get/all_users`);
        if (!response.ok) {
          throw new Error('Failed to fetch team members');
        }
        const users: User[] = await response.json();
        
        const sortedUsers = users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTeamMembers(sortedUsers);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching users.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Team Activity</CardTitle>
        <CardDescription>A snapshot of recent user logins.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          [...Array(3)].map((_, i) => (
             <div key={i} className="flex items-center gap-4">
               <Skeleton className="h-9 w-9 rounded-full" />
               <div className="flex-1 space-y-1">
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-3 w-16" />
               </div>
               <div className="text-right">
                  <Skeleton className="h-4 w-20" />
               </div>
             </div>
          ))
        )}
        {error && (
          <div className="text-destructive text-sm text-center py-4">{error}</div>
        )}
        {!isLoading && !error && teamMembers.map(user => {
            const initials = user.name
                .split(' ')
                .map((n) => n[0])
                .join('');
            
            return (
                <div key={user.id} className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photo_url} alt={user.name} data-ai-hint="person face" />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        {/* Role is not in API response, so we default it */}
                        <p className="text-sm text-muted-foreground capitalize">Lawyer</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>
                    </div>
                </div>
            )
        })}
         {!isLoading && !error && teamMembers.length === 0 && (
            <div className="text-center text-muted-foreground py-4">No team members found.</div>
         )}
      </CardContent>
    </Card>
  );
}
