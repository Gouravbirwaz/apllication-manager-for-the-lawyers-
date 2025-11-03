
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';

function PaymentProcessing() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const paymentIds = searchParams.getAll('paymentIds');
    const amount = searchParams.get('amount');
    const totalAmount = Number(amount) || 0;

    const handleConfirmPayment = async () => {
        setIsProcessing(true);

        // Simulate API call to a payment gateway like Stripe
        await new Promise(resolve => setTimeout(resolve, 3000));

        setIsProcessing(false);
        setIsComplete(true);
        
        toast({
            title: "Payment Successful",
            description: `Successfully paid ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}.`,
        });

        setTimeout(() => router.push('/dashboard/payments'), 2000);
    };
    
    if (isComplete) {
        return (
             <div className="text-center space-y-4">
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
                <CardDescription>Review the details below and confirm to process the payment. This is where a Stripe integration would be.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Amount Payable</p>
                    <p className="text-4xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                    <h3 className="font-semibold mb-2">Payment Summary</h3>
                    <p>
                        You are about to process a payment for{' '}
                        <span className="font-bold">{paymentIds.length}</span>{' '}
                        advocate(s).
                    </p>
                    {paymentIds.length < 5 && (
                         <p className="text-xs text-muted-foreground mt-1">
                            Payment IDs: {paymentIds.join(', ')}
                        </p>
                    )}
                </div>

                 <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-center">
                        [Stripe Checkout Component Placeholder]
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleConfirmPayment} disabled={isProcessing}>
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
