'use client';

import { notFound } from "next/navigation";
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
import { FilePlus2, Upload, CalendarPlus, Wand2 } from "lucide-react";
import { DocumentAnalysis } from "@/components/document-analysis";
import { useState, useEffect } from "react";
import { ScheduleHearing } from "@/components/hearings/schedule-hearing";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import type { Hearing, Document } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { analyzeLegalDocumentAction } from "@/app/actions";
import type { LegalDocumentAnalysisOutput } from "@/ai/flows/intelligent-document-summary";

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const caseData = mockCases.find((c) => c.case_id === id);

  if (!caseData) {
    notFound();
  }
  
  const client = mockUsers.find((u) => u.uid === caseData.client_id);
  const lawyer = mockUsers.find((u) => u.uid === caseData.lawyer_id);
  
  const initialCaseDocs = mockDocuments.filter((d) => d.case_id === caseData.case_id);
  const [caseDocs, setCaseDocs] = useState<Document[]>(initialCaseDocs);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(initialCaseDocs[0]?.doc_id || null);
  
  const [caseHearings, setCaseHearings] = useState<Hearing[]>(mockHearings.filter((h) => h.case_id === caseData.case_id));
  const caseTasks = mockTasks.filter((t) => t.case_id === caseData.case_id);

  const [analysis, setAnalysis] = useState<LegalDocumentAnalysisOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const handleHearingScheduled = (newHearing: Hearing) => {
    setCaseHearings(prev => [...prev, newHearing].sort((a,b) => b.date.getTime() - a.date.getTime()));
  }

  const handleDocumentUploaded = (newDocument: Document) => {
    setCaseDocs(prev => [newDocument, ...prev]);
  };

  const handleAnalyzeDocument = async () => {
    if (!selectedDocId) {
       toast({
        title: "No Document Selected",
        description: "Please select a document from the list to analyze.",
        variant: "destructive",
      });
      return;
    }

    const documentToAnalyze = caseDocs.find(doc => doc.doc_id === selectedDocId);
    if (!documentToAnalyze || !documentToAnalyze.summary) {
       toast({
        title: "Analysis Not Possible",
        description: "The selected document has no content to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysis(null);

    const result = await analyzeLegalDocumentAction({ documentText: documentToAnalyze.summary });
    
    setIsLoadingAnalysis(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.analysis) {
      setAnalysis(result.analysis);
       toast({
        title: "Analysis Complete",
        description: `Analysis for "${documentToAnalyze.title}" is ready.`,
      });
    }
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
          <TabsTrigger value="documents">Documents</TabsTrigger>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="font-headline">Documents</CardTitle>
                    <CardDescription>Select a document below to analyze it with AI.</CardDescription>
                 </div>
                
                <UploadDocumentDialog 
                  caseId={caseData.case_id} 
                  onDocumentUploaded={handleDocumentUploaded}
                >
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4"/> Upload Document
                  </Button>
                </UploadDocumentDialog>

              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedDocId || ''} onValueChange={setSelectedDocId}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead className="w-[250px]">Summary</TableHead> 
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caseDocs.map(doc => (
                        <TableRow key={doc.doc_id}>
                          <TableCell>
                            <RadioGroupItem value={doc.doc_id} id={doc.doc_id} />
                          </TableCell>
                          <TableCell className="font-medium">
                             <Label htmlFor={doc.doc_id} className="cursor-pointer">{doc.title}</Label>
                          </TableCell>
                          <TableCell className="uppercase">{doc.file_type}</TableCell>
                          <TableCell>{isClient ? doc.uploaded_at.toLocaleDateString() : '...'}</TableCell>
                          <TableCell>{doc.version}</TableCell>
                          <TableCell className="text-muted-foreground text-sm truncate max-w-xs">{doc.summary || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                      {caseDocs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                              No documents found for this case. Start by uploading one!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </RadioGroup>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <FilePlus2 /> Intelligent Document Summary
                </CardTitle>
                <CardDescription>
                  Select a document from the table above, then click the button to generate a concise summary using AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button onClick={handleAnalyzeDocument} disabled={isLoadingAnalysis || !selectedDocId}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isLoadingAnalysis ? "Analyzing..." : "Analyze Selected Document"}
                 </Button>
                <DocumentAnalysis isLoading={isLoadingAnalysis} analysis={analysis} />
              </CardContent>
            </Card>
          </div>
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
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
                    {caseTasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No tasks associated with this case.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
