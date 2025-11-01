'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import { mockHearings, mockCases, mockUsers } from "@/lib/mock-data";
import { ScheduleHearing } from '@/components/hearings/schedule-hearing';
import type { Hearing } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function HearingsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [hearings, setHearings] = useState<Hearing[]>(
    [...mockHearings].sort((a, b) => b.date.getTime() - a.date.getTime())
  );

  const handleHearingScheduled = (newHearing: Hearing) => {
    // In a real app, you'd refetch or get the new hearing from a server response
    const caseForHearing = mockCases.find(c => c.case_id === newHearing.case_id);
    const hearingWithTitle = { ...newHearing, case_title: caseForHearing?.title || 'Unknown Case' };

    setHearings(prev => [...prev, hearingWithTitle].sort((a, b) => b.date.getTime() - a.date.getTime()));
  };
  
  const getClientForCase = (caseId: string) => {
    const caseData = mockCases.find(c => c.case_id === caseId);
    if (!caseData) return undefined;
    return mockUsers.find(u => u.uid === caseData.client_id);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline text-2xl">Hearing Schedule</CardTitle>
          <CardDescription>
            A log of all upcoming and past hearings.
          </CardDescription>
        </div>
        <ScheduleHearing
          cases={mockCases}
          onHearingScheduled={handleHearingScheduled}
        >
           <Button size="sm">
            <CalendarPlus className="mr-2 h-4 w-4"/>
            Schedule Hearing
          </Button>
        </ScheduleHearing>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Courtroom</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isClient ? hearings.map((hearing) => {
              const isUpcoming = hearing.date > new Date();
              return(
                <TableRow key={hearing.hearing_id}>
                  <TableCell className="font-medium">{hearing.date.toLocaleDateString()}</TableCell>
                  <TableCell>{hearing.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell className="text-muted-foreground">{hearing.case_title}</TableCell>
                  <TableCell>{hearing.court_room}</TableCell>
                  <TableCell>
                    <Badge variant={isUpcoming ? "default" : "outline"}>
                      {isUpcoming ? "Upcoming" : "Concluded"}
                    </Badge>
                  </TableCell>
                </TableRow>
            )}) : [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
              </TableRow>
            ))}
             {isClient && hearings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hearings scheduled.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
