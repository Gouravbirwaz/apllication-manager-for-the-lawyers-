
'use client';
import { useState, useEffect, useMemo } from 'react';
import { CreditCard, CalendarClock, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './components/data-table';
import { getColumns } from './components/columns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { AdvocatePayment, User } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AddPaymentDialog } from '@/components/payments/add-payment-dialog';

const Table = ({className, ...props}: React.HTMLAttributes<HTMLTableElement>) => <table className={className} {...props} />
const TableHeader = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={className} {...props} />
const TableBody = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={className} {...props} />
const TableRow = ({className, ...props}: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={className} {...props} />
const TableHead = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <th className={className} {...props} />
const TableCell = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <td className={className} {...props} />


export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdvocatePayment[]>([]);
  const [advocates, setAdvocates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPayments = async () => {
      // Don't set loading to true here to avoid skeleton on re-fetch
      try {
        const [paymentsResponse, usersResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          })
        ]);

        if (!paymentsResponse.ok) {
          throw new Error(`Failed to fetch payments. Status: ${paymentsResponse.status}`);
        }
        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch users. Status: ${usersResponse.status}`);
        }

        const paymentsData: any[] = await paymentsResponse.json();
        const usersData: User[] = await usersResponse.json();
        
        setAdvocates(usersData);
        const usersMap = new Map(usersData.map(user => [user.id, user]));

        const transformedPayments: AdvocatePayment[] = paymentsData.map(p => {
          const advocate = usersMap.get(p.advocate_id);
          return {
            id: String(p.id),
            advocate_id: String(p.advocate_id),
            name: advocate?.name || 'Unknown Advocate',
            email: advocate?.email || 'N/A',
            cases: advocate?.total_case_handled || p.cases || 0,
            billable_hours: p.billable_hours || 0,
            status: p.transaction_status ? 'paid' : 'pending',
            total: p.amount || 0,
          };
        });

        setPayments(transformedPayments);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    
  useEffect(() => {
    fetchPayments();
  }, []);

  const handlePaymentAction = () => {
    // Re-fetch all data to ensure the table is up-to-date
    fetchPayments();
  };
  
  const totalPayable = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.total, 0);

  const columns = useMemo(() => getColumns(handlePaymentAction, handlePaymentAction, advocates), [advocates]);

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
                    {[...Array(7)].map((_, i) => (
                      <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                     <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
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
                <AddPaymentDialog advocates={advocates} onPaymentAdded={handlePaymentAction}>
                  <Button size="sm" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      New Payment
                  </Button>
                </AddPaymentDialog>
                <Button size="sm" className="gap-1" onClick={() => toast({ title: "Feature Coming Soon!", description: "Automated payment scheduling is in development."})}>
                  <CalendarClock className="h-3.5 w-3.5" />
                  Schedule
                </Button>
             </div>
            <p className="text-sm text-muted-foreground">
                Total Payable: <span className="font-semibold text-primary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalPayable)}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <DataTable columns={columns} data={payments} />
        )}
      </CardContent>
    </Card>
  );
}
