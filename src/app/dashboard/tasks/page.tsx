
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddTaskDialog } from '@/components/tasks/add-task-dialog';
import { Button } from '@/components/ui/button';
import type { Task, Case, User } from '@/lib/types';
import { DataTable } from './components/data-table';
import { getColumns } from './components/columns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Table = ({className, ...props}: React.HTMLAttributes<HTMLTableElement>) => <table className={className} {...props} />
const TableHeader = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={className} {...props} />
const TableBody = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={className} {...props} />
const TableRow = ({className, ...props}: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={className} {...props} />
const TableHead = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <th className={className} {...props} />
const TableCell = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <td className={className} {...props} />

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Set loading to true only on initial load
    if (tasks.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const [tasksRes, casesRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cases`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      ]);

      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
      if (!casesRes.ok) throw new Error('Failed to fetch cases');
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      
      const tasksData: Task[] = await tasksRes.json();
      const casesData: any[] = await casesRes.json();
      const usersData: User[] = await usersRes.json();

      const usersMap = new Map(usersData.map(u => [u.id, u]));
      const transformedCases: Case[] = casesData.map(c => ({
        ...c,
        case_id: String(c.id),
        title: c.case_title,
        filing_date: new Date(c.created_at),
        client: usersMap.get(c.client_id)
      }));

      setCases(transformedCases);
      setUsers(usersData);
      
      const casesMap = new Map(transformedCases.map(c => [c.id, c]));

      const populatedTasks = tasksData.map(task => ({
        ...task,
        assignee: usersMap.get(task.assigned_to_id),
        case: casesMap.get(task.case_id),
      }));

      setTasks(populatedTasks);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [tasks.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleTaskAction = () => {
    fetchData();
  }

  const columns = useMemo(() => getColumns(handleTaskAction, users, cases), [users, cases, handleTaskAction]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>)}
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
            <CardTitle className="font-headline text-2xl">All Tasks</CardTitle>
            <CardDescription>
            A list of all tasks across all cases.
            </CardDescription>
        </div>
        <AddTaskDialog cases={cases} onTaskAdded={handleTaskAction} allUsers={users}>
             <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                Add Task
            </Button>
        </AddTaskDialog>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <DataTable columns={columns} data={tasks} onTaskAction={handleTaskAction} allUsers={users} allCases={cases} />
        )}
      </CardContent>
    </Card>
  );
}
