
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { updateTaskAction } from '@/app/actions';

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onTaskUpdated: () => void;
  allUsers: User[];
  cases: Case[];
}

export function EditTaskDialog({ isOpen, onOpenChange, task, onTaskUpdated, allUsers, cases }: EditTaskDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(String(task.case_id));
  const [assignedToId, setAssignedToId] = useState<string>(String(task.assigned_to_id));
  const [dueDate, setDueDate] = useState<Date>(new Date(task.due_date));
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        setTitle(task.title);
        setDescription(task.description || '');
        setSelectedCaseId(String(task.case_id));
        setAssignedToId(String(task.assigned_to_id));
        setDueDate(new Date(task.due_date));
        setPriority(task.priority);
        setStatus(task.status);
    }
  }, [task, isOpen]);


  const handleUpdateTask = async () => {
    if (!title || !selectedCaseId || !assignedToId || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const result = await updateTaskAction(task.id, {
      title,
      description,
      case_id: Number(selectedCaseId),
      assigned_to_id: Number(assignedToId),
      due_date: format(dueDate, 'yyyy-MM-dd'),
      priority,
      status,
    });

    setIsSaving(false);
    
    if (result.error) {
       toast({
        title: "Error Updating Task",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.task) {
        onTaskUpdated();
        toast({
            title: "Task Updated",
            description: `"${title}" has been successfully updated.`,
        });
        onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details for this task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="case" className="text-right">Case</Label>
            <Select onValueChange={setSelectedCaseId} value={selectedCaseId}>
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
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
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
                  onSelect={(d) => d && setDueDate(d)}
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select onValueChange={(v: TaskStatus) => setStatus(v)} value={status}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
