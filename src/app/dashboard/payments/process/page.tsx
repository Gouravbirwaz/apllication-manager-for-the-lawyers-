
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Loader2, User, Users, Lock } from 'lucide-react';
import type { AdvocatePayment, User as Advocate } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { updatePaymentStatusAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
                 const [paymentsResponse, usersResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    })
                ]);

                if (!paymentsResponse.ok) throw new Error("Failed to fetch payments");
                if (!usersResponse.ok) throw new Error("Failed to fetch users");

                const allPayments: any[] = await paymentsResponse.json();
                const allUsers: Advocate[] = await usersResponse.json();
                const usersMap = new Map(allUsers.map(u => [u.id, u]));

                const filteredPayments = allPayments
                    .filter(p => paymentIds.includes(String(p.id)))
                    .map(p => {
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
                        }
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
        // --- Password Check ---
        if (password !== 'Gourav@123') {
            toast({
                title: "Incorrect Password",
                description: "The password you entered is incorrect. Please try again.",
                variant: 'destructive'
            });
            return;
        }

        setIsProcessing(true);

        // 1. Simulate API call to a payment gateway like Stripe
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 2. Update payment status on our backend
        const result = await updatePaymentStatusAction(paymentIds);

        setIsProcessing(false);

        if (result.error) {
             toast({
                title: "Payment Update Failed",
                description: result.error,
                variant: 'destructive'
            });
            // Keep the user on the page to allow them to retry if needed.
            return;
        }

        // 3. Show success and redirect
        setIsComplete(true);
        toast({
            title: "Payment Successful",
            description: `Successfully paid ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}.`,
        });

        setTimeout(() => router.push('/dashboard/payments'), 2000);
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
                <h2 className="text-2xl font-bold">Payment Complete!</h2>
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
                        <span className="font-bold">{paymentsToProcess.length}</span> advocate(s).
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
