'use client';

import { useState, useEffect } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Case, User } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface AddCaseDialogProps {
  children: React.ReactNode;
  onCaseAdded: (newCase: Case) => void;
}

export function AddCaseDialog({ children, onCaseAdded }: AddCaseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [caseType, setCaseType] = useState('');
  const [status, setStatus] = useState('open');
  const [nextHearing, setNextHearing] = useState<Date | undefined>();
  const [clientId, setClientId] = useState<string | undefined>();
  const [advocateId, setAdvocateId] = useState<string | undefined>();
  
  const [clients, setClients] = useState<User[]>([]);
  const [advocates, setAdvocates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [clientsResponse, usersResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients`, {
              headers: { 'ngrok-skip-browser-warning': 'true' },
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, {
              headers: { 'ngrok-skip-browser-warning': 'true' },
            })
          ]);
          
          if (!clientsResponse.ok) throw new Error('Failed to fetch clients');
          if (!usersResponse.ok) throw new Error('Failed to fetch advocates');

          const clientsData = await clientsResponse.json();
          const usersData = await usersResponse.json();

          setClients(clientsData);
          // Assuming advocates can be lawyers or admins
          setAdvocates(usersData.filter((u: User) => u.role === 'lawyer' || u.role === 'admin'));

        } catch (error: any) {
          toast({
            title: 'Error',
            description: `Could not load data: ${error.message}`,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, toast]);

  const handleSave = async () => {
    if (!title || !caseType || !status || !clientId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all required fields (Client, Title, Type, Status).',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          case_title: title,
          case_type: caseType,
          status,
          client_id: parseInt(clientId, 10),
          advocate_id: advocateId ? parseInt(advocateId, 10) : null,
          next_hearing: nextHearing ? nextHearing.toISOString() : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add case.');
      }
      
      toast({
        title: 'Case Added',
        description: `"${result.case.case_title}" has been successfully created.`,
      });

      onCaseAdded(result.case);
      setIsOpen(false);
      resetForm();

    } catch (error: any) {
      toast({
        title: 'Error Adding Case',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setCaseType('');
    setStatus('open');
    setNextHearing(undefined);
    setClientId(undefined);
    setAdvocateId(undefined);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Case</DialogTitle>
          <DialogDescription>
            Enter the details for the new case.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">Client</Label>
            <Select onValueChange={setClientId} value={clientId} disabled={isLoading}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={isLoading ? "Loading clients..." : "Select a client"} />
                </SelectTrigger>
                <SelectContent>
                    {clients.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.full_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="advocate" className="text-right">Advocate</Label>
            <Select onValueChange={setAdvocateId} value={advocateId} disabled={isLoading}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={isLoading ? "Loading advocates..." : "Select an advocate (optional)"} />
                </SelectTrigger>
                <SelectContent>
                    {advocates.map(a => (
                        <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Case Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" placeholder="e.g., Property Dispute at Location" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="case-type" className="text-right">Case Type</Label>
            <Input id="case-type" value={caseType} onChange={e => setCaseType(e.target.value)} className="col-span-3" placeholder="e.g., Civil, Criminal" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select onValueChange={setStatus} value={status}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="next-hearing" className="text-right">
              Next Hearing
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'col-span-3 justify-start text-left font-normal',
                    !nextHearing && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextHearing ? format(nextHearing, 'PPP') : <span>Pick a date (optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextHearing}
                  onSelect={setNextHearing}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : 'Save Case'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
