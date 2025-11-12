
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
import type { Case, Task, User, TaskPriority, TaskStatus } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createTaskAction } from '@/app/actions';

interface AddTaskDialogProps {
  children: React.ReactNode;
  cases: Case[];
  allUsers: User[];
  onTaskAdded: (task: Task) => void;
  defaultCaseId?: string;
}

export function AddTaskDialog({ children, cases, allUsers, onTaskAdded, defaultCaseId }: AddTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(defaultCaseId);
  const [assignedToId, setAssignedToId] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  
  const { toast } = useToast();

  const handleAddTask = async () => {
    if (!title || !selectedCaseId || !assignedToId || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const result = await createTaskAction({
      title,
      description,
      case_id: Number(selectedCaseId),
      assigned_to_id: Number(assignedToId),
      due_date: format(dueDate, 'yyyy-MM-dd'),
      priority,
      status: 'Pending',
    });

    setIsSaving(false);
    
    if (result.error) {
       toast({
        title: "Error Creating Task",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.task) {
        onTaskAdded(result.task);
        toast({
            title: "Task Added",
            description: `"${title}" has been successfully created.`,
        });
        setIsOpen(false);
        resetForm();
    }
  };
  
  const resetForm = () => {
      setTitle('');
      setDescription('');
      setAssignedToId(undefined);
      setDueDate(undefined);
      setPriority('Medium');
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
                        <SelectItem key={c.id} value={String(c.id)}>{c.case_title}</SelectItem>
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
            <Select onValueChange={setAssignedToId} value={assignedToId}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                    {allUsers.map(u => (
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
          
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">Priority</Label>
            <Select onValueChange={(v: TaskPriority) => setPriority(v)} value={priority}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
            </Select>
          </div>

        </div>
        <DialogFooter>
          <Button onClick={handleAddTask} disabled={isSaving}>
            {isSaving ? "Adding Task..." : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
