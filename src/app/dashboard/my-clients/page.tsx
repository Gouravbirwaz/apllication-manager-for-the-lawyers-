'use client';

import { useState, useEffect } from 'react';
import { mockUsers, mockCases, mockHearings } from '@/lib/mock-data';
import type { User, Case, Hearing } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyClientsPage() {
    const [isClient, setIsClient] = useState(false);
    const [lawyer, setLawyer] = useState<User | undefined>();
    const [clients, setClients] = useState<User[]>([]);
    const [clientCases, setClientCases] = useState<Map<string, Case[]>>(new Map());
    const [caseHearings, setCaseHearings] = useState<Map<string, Hearing[]>>(new Map());
    
    useEffect(() => {
        setIsClient(true);
        // In a real app, you'd get the logged-in lawyer's ID
        const currentLawyer = mockUsers.find(u => u.role === 'lawyer');
        setLawyer(currentLawyer);

        if (currentLawyer) {
            const lawyerCaseIds = mockCases.filter(c => c.lawyer_id === currentLawyer.uid).map(c => c.case_id);
            const lawyerClientIds = new Set(mockCases.filter(c => c.lawyer_id === currentLawyer.uid).map(c => c.client_id));
            
            const lawyerClients = mockUsers.filter(u => lawyerClientIds.has(u.uid));
            setClients(lawyerClients);

            const casesByClient = new Map<string, Case[]>();
            lawyerClients.forEach(client => {
                const casesForClient = mockCases.filter(c => c.client_id === client.uid && c.lawyer_id === currentLawyer.uid);
                casesByClient.set(client.uid, casesForClient);
            });
            setClientCases(casesByClient);
            
            const hearingsByCase = new Map<string, Hearing[]>();
            lawyerCaseIds.forEach(caseId => {
                const hearings = mockHearings
                    .filter(h => h.case_id === caseId)
                    .sort((a,b) => a.date.getTime() - b.date.getTime()); // Sort nearest to farthest
                hearingsByCase.set(caseId, hearings);
            });
            setCaseHearings(caseHearings);
        }

    }, []);

    if (!isClient) {
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
                const cases = clientCases.get(client.uid) || [];
                const clientInitials = client.full_name.split(' ').map(n => n[0]).join('');

                return (
                    <Card key={client.uid}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={client.profile_pic} />
                                <AvatarFallback>{clientInitials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl font-headline">{client.full_name}</CardTitle>
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
