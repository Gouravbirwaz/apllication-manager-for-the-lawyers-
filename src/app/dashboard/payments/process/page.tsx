
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Loader2, User, Users, Send, ExternalLink } from 'lucide-react';
import type { AdvocatePayment, User as Advocate, Invoice, Case } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { updatePaymentStatusAction, createInvoiceAction, sendInvoiceAction } from '@/app/actions';
import { format } from 'date-fns';

function PaymentProcessing() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isConfirming, setIsConfirming] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [paymentsToProcess, setPaymentsToProcess] = useState<AdvocatePayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gpayUrl, setGpayUrl] = useState<string | null>(null);

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
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cases`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
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
                        const caseForPayment = p.cases ? casesMap.get(p.cases) : undefined;
                        
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
                            client_id: caseForPayment?.client_id,
                            advocate: advocate,
                        } as AdvocatePayment
                    });

                if (filteredPayments.length === 0) {
                    setError("Could not find the specified payments.");
                } else {
                    if (filteredPayments.length === 1) {
                        const advocate = filteredPayments[0].advocate;
                        if(advocate?.gpay_details) {
                            const url = `https://gpay.app.goo.gl/pay?pa=${advocate.gpay_details}&pn=${encodeURIComponent(advocate.name)}&am=${totalAmount}&cu=INR&tn=Nyayadeep_Payment_For_${advocate.name}`;
                            setGpayUrl(url);
                        } else {
                            setError(`Advocate ${advocate?.name} does not have a GPay UPI ID configured.`);
                        }
                    } else {
                         setError("Bulk payment via GPay is not supported. Please pay one advocate at a time.");
                    }
                    setPaymentsToProcess(filteredPayments);
                }
            } catch(err: any) {
                setError(err.message || "Failed to load payment details.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchPaymentDetails();
    }, [paymentIds, totalAmount]);


    const handleConfirmPayment = async () => {
        setIsConfirming(true);

        const updateResult = await updatePaymentStatusAction(paymentIds);

        if (updateResult.error) {
             toast({
                title: "Payment Confirmation Failed",
                description: updateResult.error,
                variant: 'destructive'
            });
            setIsConfirming(false);
            return;
        }
        
        toast({
            title: "Payment Confirmed",
            description: "Payment status updated. Now generating and sending invoices...",
        });

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
                const sendResult = await sendInvoiceAction(invoiceResult.invoice.id);
                if (sendResult.error) {
                    toast({ title: 'Email Failed', description: `Could not email invoice ${invoiceResult.invoice.invoice_number}.`, variant: 'destructive'});
                } else {
                     toast({ title: 'Invoice Sent', description: <div className='flex items-center gap-2'><Send/> Invoice sent to client.</div>});
                }
            }
        }

        setIsConfirming(false);
        setIsComplete(true);
        setTimeout(() => router.push('/dashboard/payments'), 3000);
    };
    
    if (isLoading) {
        return (
            <CardContent className="flex justify-center items-center p-8">
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
                 <Button variant="outline" className="mt-4 w-full" onClick={() => router.back()}>Go Back</Button>
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
    
    const advocateName = paymentsToProcess[0]?.name;

    return (
        <>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Pay Advocate via GPay</CardTitle>
                <CardDescription>Review the details and follow the steps to complete the payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Amount to Pay</p>
                    <p className="text-4xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <User />
                        Payment Recipient
                    </h3>
                    <div className="flex justify-between">
                        <span>Advocate:</span>
                        <span className="font-medium">{advocateName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>UPI ID:</span>
                        <span className="font-mono text-xs">{paymentsToProcess[0]?.advocate?.gpay_details}</span>
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        <span className='font-semibold text-foreground'>Step 1:</span> Click the button below to open Google Pay and complete the transaction.
                    </p>
                    <Button className="w-full" size="lg" asChild>
                        <a href={gpayUrl || '#'} target="_blank" rel="noopener noreferrer">
                            <CreditCard className="mr-2 h-5 w-5" /> Pay <span className="font-bold mx-1">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</span> with GPay
                            <ExternalLink className="ml-2 h-4 w-4"/>
                        </a>
                    </Button>
                </div>

                 <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                       <span className='font-semibold text-foreground'>Step 2:</span> After paying, click here to confirm and record the transaction in the system.
                    </p>
                    <Button className="w-full" variant="outline" onClick={handleConfirmPayment} disabled={isConfirming}>
                        {isConfirming ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</> : <><CheckCircle className="mr-2 h-4 w-4" /> Confirm Payment Completion</>}
                    </Button>
                </div>

            </CardContent>
            <CardFooter>
                 <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => router.back()}>Cancel and Go Back</Button>
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
