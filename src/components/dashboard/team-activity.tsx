
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUsers } from "@/lib/mock-data";
import { formatDistanceToNow } from 'date-fns';

export function TeamActivity() {

  const teamMembers = mockUsers
    .filter(user => user.role === 'lawyer' || user.role === 'assistant' || user.role === 'admin')
    .sort((a,b) => b.last_login.getTime() - a.last_login.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Team Activity</CardTitle>
        <CardDescription>A snapshot of recent user logins.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamMembers.map(user => {
            const initials = user.full_name
                .split(' ')
                .map((n) => n[0])
                .join('');
            
            return (
                <div key={user.uid} className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profile_pic} alt={user.full_name} data-ai-hint="person face" />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">{formatDistanceToNow(user.last_login, { addSuffix: true })}</p>
                    </div>
                </div>
            )
        })}
      </CardContent>
    </Card>
  );
}
