'use client';

import { useState, useEffect } from 'react';
import { mockCases, mockHearings, mockUsers } from '@/lib/mock-data';
import type { User, Case, Hearing } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyClientsPage() {
    const [clients, setClients] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // These are still using mock data as per original implementation
    const [clientCases, setClientCases] = useState<Map<string, Case[]>>(new Map());
    const [caseHearings, setCaseHearings] = useState<Map<string, Hearing[]>>(new Map());

    useEffect(() => {
        const fetchClients = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients`;
                const response = await fetch(apiUrl, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch clients');
                }
                const data: User[] = await response.json();
                setClients(data);

                // This part still uses mock data. In a real app, you would fetch cases and hearings based on client IDs.
                const casesByClient = new Map<string, Case[]>();
                const hearingsByCase = new Map<string, Hearing[]>();
                
                // Assuming a logged-in lawyer
                const currentLawyerId = 'user-lawyer-1';

                data.forEach(client => {
                    // This matching logic is imperfect as client.id is a number and c.client_id is a string like 'user-client-1'
                    // For demo purposes, we will link some mock cases to the first few clients.
                    const casesForClient = mockCases.filter(c => c.lawyer_id === currentLawyerId);
                    
                    if (casesForClient.length > 0) {
                      // This is a placeholder logic. In a real app, cases would be fetched per client.
                      casesByClient.set(String(client.id), casesForClient);
                      casesForClient.forEach(caseItem => {
                          const hearings = mockHearings
                              .filter(h => h.case_id === caseItem.case_id)
                              .sort((a,b) => a.date.getTime() - b.date.getTime());
                          hearingsByCase.set(caseItem.case_id, hearings);
                      });
                    }
                });
                setClientCases(casesByClient);
                setCaseHearings(hearingsByCase);

            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClients();
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
                                <AvatarImage src={client.profile_pic} />
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
