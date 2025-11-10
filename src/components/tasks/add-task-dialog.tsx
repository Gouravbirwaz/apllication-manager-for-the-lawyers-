
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Case, Task, User } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';

interface AddTaskDialogProps {
  children: React.ReactNode;
  cases: Case[];
  onTaskAdded: (task: Task) => void;
  defaultCaseId?: string;
}

export function AddTaskDialog({ children, cases, onTaskAdded, defaultCaseId }: AddTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(defaultCaseId);
  const [assignedTo, setAssignedTo] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
        if (isOpen && user) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                });
                if (response.ok) {
                    const data = await response.json();
                    setAvailableUsers(data.users || []);
                } else {
                    console.error("Failed to fetch users for task assignment");
                }
            } catch (e) {
                console.error("Error fetching users:", e);
            }
        }
    };
    fetchUsers();
  }, [isOpen, user]);

  const handleAddTask = () => {
    if (!title || !selectedCaseId || !assignedTo || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to add a task.",
        variant: "destructive",
      });
      return;
    }

    const selectedCase = cases.find(c => c.case_id === selectedCaseId);
    if (!selectedCase) return;
    
    const newTask: Task = {
      task_id: `task-${Date.now()}`,
      assigned_to: assignedTo,
      case_id: selectedCaseId,
      case_title: selectedCase.title,
      title: title,
      description: description,
      status: 'pending',
      due_date: dueDate,
      created_at: new Date(),
    };

    onTaskAdded(newTask);
    toast({
        title: "Task Added",
        description: `"${title}" has been successfully created.`,
    })
    setIsOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
      setTitle('');
      setDescription('');
      setAssignedTo(undefined);
      setDueDate(undefined);
      if (!defaultCaseId) {
          setSelectedCaseId(undefined);
      }
  }


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Assign a new task to a team member for a specific case.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="case" className="text-right">Case</Label>
            <Select onValueChange={setSelectedCaseId} value={selectedCaseId} disabled={!!defaultCaseId}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a case" />
                </SelectTrigger>
                <SelectContent>
                    {cases.map(c => (
                        <SelectItem key={c.case_id} value={c.case_id}>{c.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" placeholder="e.g., Draft witness statements" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" placeholder="Provide a brief description of the task." />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignee" className="text-right">Assign To</Label>
            <Select onValueChange={setAssignedTo} value={assignedTo}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                    {availableUsers.map(u => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right">
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'col-span-3 justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

        </div>
        <DialogFooter>
          <Button onClick={handleAddTask}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    