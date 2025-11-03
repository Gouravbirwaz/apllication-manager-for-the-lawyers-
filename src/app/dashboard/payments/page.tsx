'use client';
import { useState, useEffect } from 'react';
import { Banknote, CreditCard, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { AdvocatePayment } from '@/lib/types';
import { useRouter } from 'next/navigation';

const mockAdvocatePayments: AdvocatePayment[] = [
    { id: 'adv-001', name: 'Aditi Sharma', email: 'a.sharma@nyayadeep.pro', cases: 3, hours: 45, rate: 2500, total: 112500, status: 'pending' },
    { id: 'adv-002', name: 'Vikram Rao', email: 'v.rao@nyayadeep.pro', cases: 5, hours: 72, rate: 3000, total: 216000, status: 'pending' },
    { id: 'adv-003', name: 'Priya Singh', email: 'p.singh@nyayadeep.pro', cases: 2, hours: 20, rate: 1500, total: 30000, status: 'paid' },
];

const Table = ({className, ...props}: React.HTMLAttributes<HTMLTableElement>) => <table className={className} {...props} />
const TableHeader = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={className} {...props} />
const TableBody = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={className} {...props} />
const TableRow = ({className, ...props}: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={className} {...props} />
const TableHead = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <th className={className} {...props} />
const TableCell = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <td className={className} {...props} />


export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdvocatePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPayments(mockAdvocatePayments);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  
  const totalPayable = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.total, 0);

  if (isLoading) {
    return (
       <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
             <Skeleton className="h-10 w-64" />
          </div>
          <div className="rounded-md border">
             <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(6)].map((_, i) => (
                      <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                     <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                        ))}
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <CreditCard /> Advocate Payments
            </CardTitle>
            <CardDescription>Review, schedule, and process payments for your advocates.</CardDescription>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
             <div className="flex gap-2">
                <Button size="sm" className="gap-1" onClick={() => toast({ title: "Feature Coming Soon!", description: "Automated payment scheduling is in development."})}>
                  <CalendarClock className="h-3.5 w-3.5" />
                  Schedule Payments
                </Button>
                <Button size="sm" className="gap-1" onClick={() => router.push('/dashboard/payments/process')} disabled={totalPayable === 0}>
                  <Banknote className="h-3.5 w-3.5" />
                  Bulk Pay Pending
                </Button>
             </div>
            <p className="text-sm text-muted-foreground">
                Total Payable: <span className="font-semibold text-primary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalPayable)}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <DataTable columns={columns} data={payments} />
      </CardContent>
    </Card>
  );
}
