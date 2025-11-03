
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Case, CaseStatus, User } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { updateCaseAction } from '@/app/actions';

interface EditCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  caseData: Case;
  onCaseUpdated: (updatedCase: Case) => void;
}

export function EditCaseDialog({ isOpen, onOpenChange, caseData, onCaseUpdated }: EditCaseDialogProps) {
  const [title, setTitle] = useState(caseData.title);
  const [caseType, setCaseType] = useState(caseData.case_type);
  const [status, setStatus] = useState(caseData.status);
  const [nextHearing, setNextHearing] = useState<Date | undefined>(
    caseData.next_hearing ? new Date(caseData.next_hearing) : undefined
  );
  const [clientId, setClientId] = useState<string | undefined>(
      caseData.client ? String(caseData.client.id) : undefined
  );
  const [advocateId, setAdvocateId] = useState<string | undefined>(
    caseData.lawyer ? String(caseData.lawyer.id) : undefined
  );
  
  const [clients, setClients] = useState<User[]>([]);
  const [advocates, setAdvocates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setTitle(caseData.title);
    setCaseType(caseData.case_type);
    setStatus(caseData.status);
    setNextHearing(caseData.next_hearing ? new Date(caseData.next_hearing) : undefined);
    setClientId(caseData.client ? String(caseData.client.id) : undefined);
    setAdvocateId(caseData.lawyer ? String(caseData.lawyer.id) : undefined);
  }, [caseData]);

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
          setAdvocates(usersData);

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
    
    const updatedCaseData = {
        id: caseData.id,
        case_title: title,
        case_type: caseType,
        status,
        client_id: parseInt(clientId, 10),
        advocate_id: advocateId ? parseInt(advocateId, 10) : undefined,
        next_hearing: nextHearing ? format(nextHearing, 'yyyy-MM-dd') : null,
    };

    const result = await updateCaseAction(updatedCaseData as Partial<Case>);

    setIsSaving(false);

    if (result.case) {
        toast({
            title: 'Case Updated',
            description: `"${result.case.case_title}" has been successfully updated.`,
        });
        onCaseUpdated(result.case);
        onOpenChange(false);
    } else {
        toast({
            title: 'Error Updating Case',
            description: result.error || 'An unexpected error occurred.',
            variant: 'destructive',
        });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Case</DialogTitle>
          <DialogDescription>
            Update the details for the case &quot;{caseData.title}&quot;.
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
            <Input id="case-type" value={caseType as string} onChange={e => setCaseType(e.target.value as any)} className="col-span-3" placeholder="e.g., Civil, Criminal" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select onValueChange={(value: CaseStatus) => setStatus(value)} value={status}>
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
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
