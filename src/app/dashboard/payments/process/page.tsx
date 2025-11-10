
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Loader2, User, Users, Lock, Send } from 'lucide-react';
import type { AdvocatePayment, User as Advocate, Invoice, Case } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { updatePaymentStatusAction, createInvoiceAction, sendInvoiceAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

function PaymentProcessing() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [paymentsToProcess, setPaymentsToProcess] = useState<AdvocatePayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const paymentIds = useMemo(() => searchParams.getAll('paymentIds'), [searchParams]);
    const amount = searchParams.get('amount');
    const totalAmount = Number(amount) || 0;

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (paymentIds.length === 0) {
                setError("No payment IDs provided.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                 const [paymentsResponse, usersResponse, casesResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/with-clients`, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    })
                ]);

                if (!paymentsResponse.ok) throw new Error("Failed to fetch payments");
                if (!usersResponse.ok) throw new Error("Failed to fetch users");
                if (!casesResponse.ok) throw new Error("Failed to fetch cases");

                const allPayments: any[] = await paymentsResponse.json();
                const allUsers: Advocate[] = await usersResponse.json();
                const allCases: any[] = await casesResponse.json();
                
                const usersMap = new Map(allUsers.map(u => [u.id, u]));
                const casesMap = new Map(allCases.map(c => [c.id, c]));

                const filteredPayments = allPayments
                    .filter(p => paymentIds.includes(String(p.id)))
                    .map(p => {
                        const advocate = usersMap.get(p.advocate_id);
                        // The backend returns 'case' for the id, which is used here as 'p.case'
                        const caseForPayment = p.case ? casesMap.get(p.case) : undefined;
                        return {
                            id: String(p.id),
                            advocate_id: String(p.advocate_id),
                            name: advocate?.name || 'Unknown Advocate',
                            email: advocate?.email || 'N/A',
                            cases: p.cases || 0,
                            billable_hours: p.billable_hours || 0,
                            status: p.transaction_status ? 'paid' : 'pending',
                            total: p.amount || 0,
                            case_id: caseForPayment?.id,
                            client_id: caseForPayment?.client?.id,
                        } as AdvocatePayment
                    });
                
                setPaymentsToProcess(filteredPayments);
            } catch(err: any) {
                setError(err.message || "Failed to load payment details.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchPaymentDetails();
    }, [paymentIds]);


    const handleConfirmPayment = async () => {
        if (password !== 'Gourav@123') {
            toast({
                title: "Incorrect Password",
                description: "The password you entered is incorrect. Please try again.",
                variant: 'destructive'
            });
            return;
        }

        setIsProcessing(true);

        // 1. Simulate API call to a payment gateway
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 2. Update payment status on our backend
        const updateResult = await updatePaymentStatusAction(paymentIds);

        if (updateResult.error) {
             toast({
                title: "Payment Update Failed",
                description: updateResult.error,
                variant: 'destructive'
            });
            setIsProcessing(false);
            return;
        }
        
        toast({
            title: "Payment Confirmed",
            description: "Payment status updated. Now generating and sending invoices...",
        });

        // 3. Create and send invoices for each payment
        for (const payment of paymentsToProcess) {
            if (!payment.client_id || !payment.case_id) {
                toast({ title: "Invoice Skipped", description: `Could not create invoice for ${payment.name} due to missing client/case ID.`, variant: 'destructive'});
                continue;
            }

            const today = new Date();
            const dueDate = new Date(today);
            dueDate.setDate(dueDate.getDate() + 30);

            const invoiceData: Partial<Invoice> = {
                client_id: payment.client_id,
                case_id: payment.case_id,
                invoice_number: `INV-${Date.now()}-${payment.case_id}`,
                issue_date: format(today, 'yyyy-MM-dd'),
                due_date: format(dueDate, 'yyyy-MM-dd'),
                total_amount: payment.total,
                status: "Paid",
                description: `Professional fees for services rendered by Advocate ${payment.name}. Payment ID: ${payment.id}.`
            };

            const invoiceResult = await createInvoiceAction(invoiceData);
            if (invoiceResult.error || !invoiceResult.invoice) {
                toast({ title: 'Invoice Creation Failed', description: invoiceResult.error, variant: 'destructive' });
            } else {
                toast({ title: 'Invoice Created', description: `Invoice ${invoiceResult.invoice.invoice_number} created.`});
                // Send email
                const sendResult = await sendInvoiceAction(invoiceResult.invoice.id);
                if (sendResult.error) {
                    toast({ title: 'Email Failed', description: `Could not email invoice ${invoiceResult.invoice.invoice_number}.`, variant: 'destructive'});
                } else {
                     toast({ title: 'Invoice Sent', description: <div className='flex items-center gap-2'><Send/> Invoice sent to client.</div>});
                }
            }
        }


        setIsProcessing(false);
        setIsComplete(true);
        setTimeout(() => router.push('/dashboard/payments'), 3000);
    };
    
    if (isLoading) {
        return (
            <CardContent>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
        )
    }

    if (error) {
        return (
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </CardContent>
        )
    }
    
    if (isComplete) {
        return (
             <div className="text-center space-y-4 p-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-pulse" />
                <h2 className="text-2xl font-bold">Process Complete!</h2>
                <p className="text-muted-foreground">Redirecting you back to the payments dashboard...</p>
            </div>
        )
    }

    return (
        <>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Confirm Payment</CardTitle>
                <CardDescription>Review the details and enter your password to authorize this transaction.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Amount Payable</p>
                    <p className="text-4xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        {paymentsToProcess.length > 1 ? <Users /> : <User />}
                        Payment Summary
                    </h3>
                    <p>
                        You are about to process a payment for{' '}
                        <span className="font-bold">{paymentsToProcess.length}</span> advocate(s). An invoice will be generated and emailed to the respective client for each payment.
                    </p>
                    {paymentsToProcess.length > 0 && paymentsToProcess.length < 5 && (
                         <div className="text-xs text-muted-foreground mt-2">
                            <p className="font-medium">Recipients:</p>
                            <ul className="list-disc pl-4">
                                {paymentsToProcess.map(p => <li key={p.id}>{p.name}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Confirm Password
                        </div>
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password to confirm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleConfirmPayment} disabled={isProcessing || totalAmount === 0 || !password}>
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><CreditCard className="mr-2 h-4 w-4" /> Confirm & Pay</>}
                </Button>
            </CardFooter>
        </>
    );
}


export default function ProcessPaymentPage() {
  return (
    <div className="flex justify-center items-center h-full">
        <Card className="w-full max-w-md">
            <Suspense fallback={<CardContent><Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" /></CardContent>}>
                <PaymentProcessing />
            </Suspense>
        </Card>
    </div>
  );
}

    