
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileText, Send } from 'lucide-react';
import type { Invoice, User } from '@/lib/types';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendInvoiceAction } from '@/app/actions';

function InvoicesSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoading: isUserLoading } = useUser();
    const { toast } = useToast();

    useEffect(() => {
        if (user?.role !== 'main') {
            setIsLoading(false);
            return;
        }

        const fetchInvoices = async () => {
            setIsLoading(true);
            try {
                const [invoicesRes, usersRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
                ]);

                if (!invoicesRes.ok) throw new Error('Failed to fetch invoices.');
                if (!usersRes.ok) throw new Error('Failed to fetch users.');

                const invoicesData: Invoice[] = await invoicesRes.json();
                const usersData: User[] = await usersRes.json();
                const usersMap = new Map(usersData.map(u => [u.id, u]));

                const populatedInvoices = invoicesData.map(inv => ({
                    ...inv,
                    client: usersMap.get(inv.client_id)
                }));

                setInvoices(populatedInvoices.sort((a,b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()));
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoices();
    }, [user]);

    const handleResendInvoice = async (invoiceId: number) => {
        toast({ title: 'Sending...', description: 'Sending invoice to the client.' });
        const result = await sendInvoiceAction(invoiceId);
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Invoice Sent!', description: 'The invoice has been re-sent to the client.', icon: <Send /> });
        }
    };

    if (isLoading || isUserLoading) {
        return <InvoicesSkeleton />;
    }

    if (user?.role !== 'main') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2 text-destructive"><AlertCircle/> Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Only users with the 'main' role can access the invoices section.</p>
                </CardContent>
            </Card>
        );
    }
    
    if (error) {
        return (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <FileText /> Invoices
                </CardTitle>
                <CardDescription>A record of all generated invoices for client billing.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Issue Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => {
                                let statusVariant: "default" | "secondary" | "outline" | "destructive" = "default";
                                switch (invoice.status) {
                                    case "Paid": statusVariant = "outline"; break;
                                    case "Pending": statusVariant = "default"; break;
                                    case "Overdue": statusVariant = "destructive"; break;
                                }
                                return (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                        <TableCell>{invoice.client?.name || 'N/A'}</TableCell>
                                        <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                                        <TableCell><Badge variant={statusVariant}>{invoice.status}</Badge></TableCell>
                                        <TableCell className="text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.total_amount)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="sm" onClick={() => handleResendInvoice(invoice.id)}>
                                                <Send className="mr-2 h-4 w-4" />
                                                Resend
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
