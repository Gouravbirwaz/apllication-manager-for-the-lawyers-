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
import { mockCases, mockTasks, mockUsers } from "@/lib/mock-data";
import { Skeleton } from '@/components/ui/skeleton';
import { AddTaskDialog } from '@/components/tasks/add-task-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Task } from '@/lib/types';


export default function TasksPage() {
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTaskAdded = (newTask: Task) => {
    setTasks(prev => [...prev, newTask].sort((a,b) => a.due_date.getTime() - b.due_date.getTime()));
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
            <CardTitle className="font-headline text-2xl">My Tasks</CardTitle>
            <CardDescription>
            A list of all tasks assigned to you.
            </CardDescription>
        </div>
        <AddTaskDialog cases={mockCases} onTaskAdded={handleTaskAdded}>
             <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add Task
            </Button>
        </AddTaskDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const assignee = mockUsers.find(
                (user) => user.uid === task.assigned_to
              );
              let statusVariant: "default" | "secondary" | "outline" = "default";
              if (task.status === "in-progress") statusVariant = "secondary";
              if (task.status === "done") statusVariant = "outline";

              return (
                <TableRow key={task.task_id}>
                  <TableCell>
                    <Badge variant={statusVariant} className="capitalize">{task.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">{task.case_title}</TableCell>
                  <TableCell>{task.due_date.toLocaleDateString()}</TableCell>
                  <TableCell>{assignee?.full_name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
