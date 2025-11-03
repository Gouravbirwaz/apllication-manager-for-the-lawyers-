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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User, AdvocatePayment } from '@/lib/types';
import { addPaymentAction } from '@/app/actions';

interface AddPaymentDialogProps {
  children: React.ReactNode;
  advocates: User[];
  onPaymentAdded: () => void;
}

export function AddPaymentDialog({ children, advocates, onPaymentAdded }: AddPaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [advocateId, setAdvocateId] = useState<string | undefined>();
  const [cases, setCases] = useState('');
  const [billableHours, setBillableHours] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!advocateId || !amount) {
      toast({
        title: 'Missing Information',
        description: 'Please select an advocate and enter an amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const result = await addPaymentAction({
      advocate_id: advocateId,
      status: status,
      cases: Number(cases) || 0,
      billable_hours: parseFloat(billableHours) || 0,
      total: parseFloat(amount),
    });

    setIsSaving(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Payment record added successfully.',
      });
      onPaymentAdded();
      setIsOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setAdvocateId(undefined);
    setCases('');
    setBillableHours('');
    setAmount('');
    setStatus('pending');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Payment Record</DialogTitle>
          <DialogDescription>Enter the details for the new payment.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="advocate" className="text-right">Advocate</Label>
            <Select onValueChange={setAdvocateId} value={advocateId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an advocate" />
              </SelectTrigger>
              <SelectContent>
                {advocates.map((advocate) => (
                  <SelectItem key={advocate.id} value={String(advocate.id)}>{advocate.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Amount (INR)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="e.g., 50000" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cases" className="text-right">Cases</Label>
            <Input id="cases" type="number" value={cases} onChange={(e) => setCases(e.target.value)} className="col-span-3" placeholder="Number of cases" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="billable-hours" className="text-right">Billable Hours</Label>
            <Input id="billable-hours" type="number" value={billableHours} onChange={(e) => setBillableHours(e.target.value)} className="col-span-3" placeholder="e.g., 40.5" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select onValueChange={(value: 'pending' | 'paid') => setStatus(value)} value={status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
