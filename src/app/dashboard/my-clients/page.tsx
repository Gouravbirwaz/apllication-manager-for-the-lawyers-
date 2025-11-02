'use client';

import { useState, useEffect } from 'react';
import type { User, Case, Hearing } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { mockHearings } from '@/lib/mock-data'; // Hearings will remain mock for now

export default function MyClientsPage() {
    const [clients, setClients] = useState<User[]>([]);
    const [clientCases, setClientCases] = useState<Map<string, Case[]>>(new Map());
    const [caseHearings, setCaseHearings] = useState<Map<string, Hearing[]>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClientsAndCases = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all cases which include client details
                const casesApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/with-clients`;
                const casesResponse = await fetch(casesApiUrl, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                    },
                });

                if (!casesResponse.ok) {
                    throw new Error('Failed to fetch cases with client details');
                }
                const casesData: Case[] = await casesResponse.json();

                // Process data to group cases by client
                const clientsMap = new Map<string, User>();
                const casesByClient = new Map<string, Case[]>();
                const hearingsByCase = new Map<string, Hearing[]>();

                casesData.forEach(caseItem => {
                    const client = caseItem.client;
                    if (client && !clientsMap.has(String(client.id))) {
                        clientsMap.set(String(client.id), client);
                    }
                    
                    const processedCase: Case = {
                        ...caseItem,
                        case_id: caseItem.id.toString(),
                        title: caseItem.case_title,
                        filing_date: new Date(caseItem.created_at),
                        next_hearing: caseItem.next_hearing ? new Date(caseItem.next_hearing) : undefined,
                    };

                    if (client) {
                        const existingCases = casesByClient.get(String(client.id)) || [];
                        casesByClient.set(String(client.id), [...existingCases, processedCase]);
                    }
                    
                    // This part still uses mock data for hearings.
                    const hearings = mockHearings
                        .filter(h => h.case_id === caseItem.case_id) // This link is weak, needs real data
                        .sort((a,b) => a.date.getTime() - b.date.getTime());
                    hearingsByCase.set(processedCase.case_id, hearings);
                });

                setClients(Array.from(clientsMap.values()));
                setClientCases(casesByClient);
                setCaseHearings(hearingsByCase);

            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClientsAndCases();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                </Card>
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <Card key={i}>
                             <CardHeader className="flex flex-row items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className='space-y-2'>
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Users /> My Clients
                    </CardTitle>
                    <CardDescription>
                        An overview of your clients and their associated cases.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-12 text-center text-destructive">
                    <p>Error: {error}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Users /> My Clients
                    </CardTitle>
                    <CardDescription>
                        An overview of your clients and their associated cases.
                    </CardDescription>
                </CardHeader>
            </Card>

            {clients.length > 0 ? clients.map(client => {
                const cases = clientCases.get(String(client.id)) || [];
                const clientName = client.full_name || 'Unnamed Client';
                const clientInitials = clientName.split(' ').map(n => n[0]).join('');

                return (
                    <Card key={client.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={client.photo_url} />
                                <AvatarFallback>{clientInitials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl font-headline">{clientName}</CardTitle>
                                <CardDescription>{client.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {cases.map(c => {
                                    const hearings = caseHearings.get(c.case_id) || [];
                                    const upcomingHearings = hearings.filter(h => h.date > new Date());
                                    
                                    return (
                                        <AccordionItem value={c.case_id} key={c.case_id}>
                                            <AccordionTrigger>
                                                <div className='flex items-center gap-4'>
                                                    <Briefcase className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="font-semibold text-left">{c.title}</p>
                                                        <div className='text-sm text-muted-foreground text-left'>Status: <Badge variant={c.status === 'closed' ? 'outline' : 'default'} className="capitalize">{c.status}</Badge></div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                {upcomingHearings.length > 0 ? (
                                                    <div className='pl-8 space-y-2'>
                                                        <h4 className='font-semibold text-sm flex items-center gap-2'><Calendar className="h-4 w-4"/> Upcoming Hearings</h4>
                                                        <ul className='list-disc pl-5 text-sm text-muted-foreground'>
                                                        {upcomingHearings.map(h => (
                                                            <li key={h.hearing_id}>
                                                                {h.date.toLocaleDateString()} at {h.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Courtroom {h.court_room}
                                                            </li>
                                                        ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <p className="pl-8 text-sm text-muted-foreground">No upcoming hearings for this case.</p>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                                 {cases.length === 0 && (
                                     <p className="text-sm text-muted-foreground p-4">No cases found for this client.</p>
                                 )}
                            </Accordion>
                        </CardContent>
                    </Card>
                )
            }) : (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        You have not been assigned to any clients yet.
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
