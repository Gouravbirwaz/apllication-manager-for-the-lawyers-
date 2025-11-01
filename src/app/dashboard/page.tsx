'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CaseStatusChart } from '@/components/dashboard/case-status-chart';
import { UpcomingHearings } from '@/components/dashboard/upcoming-hearings';
import { mockCases, mockHearings, mockTasks } from '@/lib/mock-data';
import { Briefcase, CalendarClock, ListTodo } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openCases = mockCases.filter(c => c.status === 'in-progress' || c.status === 'open').length;
  const upcomingHearingsCount = mockHearings.filter(h => h.date > new Date()).length;
  const pendingTasks = mockTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const myPendingTasks = mockTasks.filter(t => t.status !== 'done').slice(0, 5);

  if (!isClient) {
    return (
       <div className="space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
             <CardHeader>
               <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center">
                       <div className="flex flex-col items-center justify-center p-2 mr-4 rounded-md">
                         <Skeleton className="h-4 w-8 mb-1" />
                         <Skeleton className="h-6 w-6" />
                       </div>
                       <div className="ml-4 space-y-1">
                         <Skeleton className="h-4 w-32" />
                         <Skeleton className="h-3 w-24" />
                       </div>
                       <div className="ml-auto">
                         <Skeleton className="h-4 w-12" />
                       </div>
                     </div>
                  ))}
                </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Open Cases" value={openCases.toString()} icon={Briefcase} />
        <StatCard title="Upcoming Hearings" value={upcomingHearingsCount.toString()} icon={CalendarClock} />
        <StatCard title="Pending Tasks" value={pendingTasks.toString()} icon={ListTodo} />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Case Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <CaseStatusChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Hearings</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingHearings />
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">My Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myPendingTasks.map(task => (
                <TableRow key={task.task_id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.case_title}</TableCell>
                  <TableCell>{task.due_date.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'pending' ? 'destructive' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
