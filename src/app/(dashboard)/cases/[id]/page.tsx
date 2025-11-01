'use client';

import { notFound } from "next/navigation";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCases, mockDocuments, mockHearings, mockTasks, mockUsers } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilePlus2, Upload, CalendarPlus, FolderOpen } from "lucide-react";
import { DocumentSummary } from "@/components/document-summary";
import { useState, useEffect } from "react";
import { ScheduleHearing } from "@/components/hearings/schedule-hearing";
import type { Hearing } from "@/lib/types";

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const caseData = mockCases.find((c) => c.case_id === params.id);

  if (!caseData) {
    notFound();
  }
  
  const client = mockUsers.find((u) => u.uid === caseData.client_id);
  const lawyer = mockUsers.find((u) => u.uid === caseData.lawyer_id);
  const caseDocs = mockDocuments.filter((d) => d.case_id === caseData.case_id);
  
  const [caseHearings, setCaseHearings] = useState<Hearing[]>(mockHearings.filter((h) => h.case_id === caseData.case_id));
  const caseTasks = mockTasks.filter((t) => t.case_id === caseData.case_id);

  const handleHearingScheduled = (newHearing: Hearing) => {
    setCaseHearings(prev => [...prev, newHearing].sort((a,b) => b.date.getTime() - a.date.getTime()));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline">{caseData.title}</h1>
        <p className="text-muted-foreground">Case ID: {caseData.case_id}</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Client:</strong> {client?.full_name}</div>
                <div><strong>Lead Lawyer:</strong> {lawyer?.full_name}</div>
                <div><strong>Court:</strong> {caseData.court_name}</div>
                <div><strong>Filing Date:</strong> {isClient ? caseData.filing_date.toLocaleDateString() : '...'}</div>
                <div>
                  <strong>Status:</strong> <Badge variant={caseData.status === 'closed' ? 'outline' : 'default'} className="capitalize">{caseData.status}</Badge>
                </div>
                 <div>
                  <strong>Type:</strong> <Badge variant="secondary" className="capitalize">{caseData.case_type}</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{caseData.description}</p>
              </div>
               <div className="border-t pt-4">
                <Link href={`/dashboard/cases/${caseData.case_id}/documents`}>
                  <Button variant="outline">
                    <FolderOpen className="mr-2 h-4 w-4"/> View Documents ({caseDocs.length})
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
           <Card className="mt-6">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <FilePlus2 /> Intelligent Document Summary
                </CardTitle>
                <CardDescription>
                  Paste text from a legal document to generate a concise summary using AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentSummary initialSummary={caseDocs[0]?.summary} />
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="hearings">
           <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="font-headline">Scheduled Hearings</CardTitle>
                <ScheduleHearing 
                  caseData={caseData}
                  onHearingScheduled={handleHearingScheduled}
                >
                  <Button size="sm">
                    <CalendarPlus className="mr-2 h-4 w-4"/>
                    Schedule Hearing
                  </Button>
                </ScheduleHearing>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Courtroom</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseHearings.map(hearing => (
                       <TableRow key={hearing.hearing_id}>
                        <TableCell>{isClient ? hearing.date.toLocaleDateString() : '...'}</TableCell>
                        <TableCell>{isClient ? hearing.date.toLocaleTimeString() : '...'}</TableCell>
                        <TableCell>{hearing.court_room}</TableCell>
                        <TableCell>{hearing.remarks}</TableCell>
                      </TableRow>
                    ))}
                     {caseHearings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No hearings scheduled.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
              <CardHeader>
                <CardTitle className="font-headline">Associated Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseTasks.map(task => {
                      const assignee = mockUsers.find(u => u.uid === task.assigned_to);
                      return (
                       <TableRow key={task.task_id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{assignee?.full_name}</TableCell>
                        <TableCell>{isClient ? task.due_date.toLocaleDateString() : '...'}</TableCell>
                        <TableCell>
                          <Badge variant={task.status === 'done' ? 'outline' : 'default'} className="capitalize">{task.status}</Badge>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
