'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CaseStatusChart } from '@/components/dashboard/case-status-chart';
import { mockCases, mockHearings, mockTasks } from '@/lib/mock-data';
import { Briefcase, CalendarClock, ListTodo } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Agenda } from '@/components/dashboard/agenda';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openCases = mockCases.filter(c => c.status === 'in-progress' || c.status === 'open').length;
  const upcomingHearingsCount = mockHearings.filter(h => h.date > new Date()).length;
  const pendingTasks = mockTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  
  const agendaItems = [
    ...mockHearings
      .filter(h => h.date > new Date())
      .map(h => ({ type: 'hearing', date: h.date, title: h.case_title, id: h.hearing_id, details: `Courtroom ${h.court_room}` })),
    ...mockTasks
      .filter(t => t.status !== 'done')
      .map(t => ({ type: 'task', date: t.due_date, title: t.title, id: t.task_id, details: t.case_title }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());


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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                    <Agenda items={agendaItems} />
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Case Status Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <CaseStatusChart />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
