import { StatCard } from '@/components/dashboard/stat-card';
import { CaseStatusChart } from '@/components/dashboard/case-status-chart';
import { UpcomingHearings } from '@/components/dashboard/upcoming-hearings';
import { mockCases, mockHearings, mockTasks } from '@/lib/mock-data';
import { Briefcase, CalendarClock, ListTodo, CheckCircle } from 'lucide-react';
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

export default function DashboardPage() {
  const openCases = mockCases.filter(c => c.status === 'in-progress' || c.status === 'open').length;
  const upcomingHearingsCount = mockHearings.filter(h => h.date > new Date()).length;
  const pendingTasks = mockTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;

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
              {mockTasks.filter(t => t.status !== 'done').slice(0, 5).map(task => (
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
