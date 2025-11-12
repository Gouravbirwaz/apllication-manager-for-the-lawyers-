
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
import { updatePaymentStatusAction, createInvoiceAction, sendInvoiceAction, createRazorpayOrderAction } from '@/app/actions';
import { format } from 'date-fns';

declare global {
    interface Window {
        Razorpay: any;
    }
}

function PaymentProcessing() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isConfirming, setIsConfirming] = useState(false);
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
                        const caseForPayment = p.case ? casesMap.get(p.case) : undefined;
                        
                        return {
                            id: String(p.id),
                            advocate_id: String(p.advocate_id),
                            name: advocate?.name || 'Unknown Advocate',
                            email: advocate?.email || 'N/A',
                            billable_hours: p.billable_hours || 0,
                            status: p.transaction_status ? 'paid' : 'pending',
                            total: p.amount || 0,
                            case_id: caseForPayment?.id,
                            client_id: caseForPayment?.client_id, // Correctly pass the client_id from the case
                            advocate: advocate,
                        } as AdvocatePayment
                    });

                if (filteredPayments.length === 0) {
                    setError("Could not find the specified payments.");
                } else {
                    setPaymentsToProcess(filteredPayments);
                }
            } catch(err: any) {
                setError(err.message || "Failed to load payment details.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchPaymentDetails();
    }, [paymentIds]);

    const handleLaunchRazorpay = async () => {
      setIsConfirming(true);
      const advocate = paymentsToProcess[0]?.advocate;
      if (!advocate) {
          setError("Advocate details are missing.");
          setIsConfirming(false);
          return;
      }
    
      const orderResult = await createRazorpayOrderAction({ amount: totalAmount });
    
      if (orderResult.error || !orderResult.order) {
        toast({ title: "Error", description: orderResult.error || "Could not create Razorpay order.", variant: 'destructive'});
        setIsConfirming(false);
        return;
      }
    
      const { order } = orderResult;
    
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Nyayadeep Law Firm",
        description: `Payment to ${advocate.name}`,
        order_id: order.id,
        handler: async function (response: any) {
            // Here you would typically verify the signature on your backend
            // For now, we will proceed optimistically
            toast({ title: "Payment Successful", description: `ID: ${response.razorpay_payment_id}`});
            await handleConfirmPayment(response.razorpay_payment_id, order.id);
        },
        prefill: {
            name: "Your Firm Name", // Or fetch the current user's name
            email: "firm@example.com",
        },
        theme: {
            color: "#FFC266"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
            toast({
                title: "Payment Failed",
                description: response.error.description,
                variant: 'destructive'
            });
            setIsConfirming(false);
      });

      rzp.open();
    };


    const handleConfirmPayment = async (paymentId: string, orderId: string) => {
        // This is now called by the Razorpay handler
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
                description: `Professional fees for services rendered by Advocate ${payment.name}. Payment ID: ${paymentId}.`
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
                <CardTitle className="font-headline text-2xl">Pay Advocate via Razorpay</CardTitle>
                <CardDescription>Review the details and proceed to checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Amount to Pay</p>
                    <p className="text-4xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        {paymentsToProcess.length > 1 ? <Users /> : <User />}
                        Payment Recipient{paymentsToProcess.length > 1 ? 's' : ''}
                    </h3>
                    {paymentsToProcess.map(p => (
                        <div key={p.id} className="flex justify-between">
                            <span>{p.name}</span>
                            <span className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.total)}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 text-center">
                    <Button className="w-full" size="lg" onClick={handleLaunchRazorpay} disabled={isConfirming}>
                        {isConfirming ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait...</> : <><CreditCard className="mr-2 h-5 w-5" /> Proceed to Pay</>}
                    </Button>
                    <p className="text-xs text-muted-foreground">You will be redirected to Razorpay to complete your payment.</p>
                </div>

            </CardContent>
            <CardFooter>
                 <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => router.back()}>Cancel and Go Back</Button>
            </CardFooter>
        </>
    );
}


export default function ProcessPaymentPage() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

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

    