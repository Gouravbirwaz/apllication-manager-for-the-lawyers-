
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User, AdvocatePayment, Case } from '@/lib/types';
import { updatePaymentAction } from '@/app/actions';

interface EditPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payment: AdvocatePayment;
  advocates: User[];
  cases: Case[];
  onPaymentUpdated: () => void;
}

export function EditPaymentDialog({ isOpen, onOpenChange, payment, advocates, cases, onPaymentUpdated }: EditPaymentDialogProps) {
  const [advocateId, setAdvocateId] = useState(payment.advocate_id);
  const [caseId, setCaseId] = useState(payment.case_id);
  const [billableHours, setBillableHours] = useState(String(payment.billable_hours));
  const [amount, setAmount] = useState(String(payment.total));
  const [status, setStatus] = useState<'pending' | 'paid'>(payment.status);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setAdvocateId(payment.advocate_id);
      setCaseId(payment.case_id);
      setBillableHours(String(payment.billable_hours));
      setAmount(String(payment.total));
      setStatus(payment.status);
    }
  }, [isOpen, payment]);

  const handleSave = async () => {
    if (!advocateId || !amount || !caseId) {
      toast({
        title: 'Missing Information',
        description: 'Advocate, Case, and Amount are required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const result = await updatePaymentAction(payment.id, {
      advocate_id: advocateId,
      status: status,
      case_id: Number(caseId),
      billable_hours: parseFloat(billableHours),
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
        description: 'Payment record updated successfully.',
      });
      onPaymentUpdated();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Payment Record</DialogTitle>
          <DialogDescription>Update the payment details for {payment.name}.</DialogDescription>
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
            <Label htmlFor="case" className="text-right">Case</Label>
            <Select onValueChange={(value) => setCaseId(Number(value))} value={caseId ? String(caseId) : undefined}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((caseItem) => (
                  <SelectItem key={caseItem.id} value={String(caseItem.id)}>{caseItem.case_title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Amount (INR)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="e.g., 50000" />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
