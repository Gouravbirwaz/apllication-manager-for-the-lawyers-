

'use client';

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilePlus2, Upload, CalendarPlus, Wand2, Video, FileText, Trash2, BookText } from "lucide-react";
import { DocumentAnalysis } from "@/components/document-analysis";
import { useState, useEffect } from "react";
import { ScheduleHearing } from "@/components/hearings/schedule-hearing";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import type { Hearing, Document, Task, Case, User, CaseStatus } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { analyzeLegalDocumentAction, updateCaseStatusAction, deleteDocumentAction } from "@/app/actions";
import type { LegalDocumentAnalysisOutput } from "@/ai/flows/intelligent-document-summary";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { mockHearings } from "@/lib/mock-data";


function CaseDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-9 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-10 w-full max-w-md" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-5 w-full max-w-sm" />)}
                    </div>
                    <div>
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function CaseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { user } = useUser();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [caseDocs, setCaseDocs] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  
  const [caseHearings, setCaseHearings] = useState<Hearing[]>([]);
  const [caseTasks, setCaseTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [analysis, setAnalysis] = useState<LegalDocumentAnalysisOutput | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const fetchCaseAndRelatedData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
        const [caseResponse, docsResponse, tasksResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/${id}`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            }),
             fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/case/${id}/documents`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            })
        ]);

        if (caseResponse.status === 404) {
             notFound();
             return;
        }
        if (!caseResponse.ok) throw new Error(`Failed to fetch case details. Status: ${caseResponse.status}`);
        
        if (!docsResponse.ok) console.error('Failed to fetch documents');
        if (!tasksResponse.ok) console.error('Failed to fetch tasks');

        const caseJson = await caseResponse.json();
        const docsJson = await docsResponse.json();
        const allTasks: Task[] = tasksResponse.ok ? await tasksResponse.json() : [];
        
        const transformedCase: Case = {
            ...caseJson,
            case_id: caseJson.id.toString(),
            title: caseJson.case_title,
            filing_date: new Date(caseJson.created_at),
            next_hearing: caseJson.next_hearing ? new Date(caseJson.next_hearing) : undefined,
        };
        setCaseData(transformedCase);

        if(docsJson.documents) {
            setCaseDocs(docsJson.documents);
        }

        const filteredTasks = allTasks.filter(t => t.case_id === transformedCase.id);
        setCaseTasks(filteredTasks);

        // TODO: Replace with real endpoints when available
        setCaseHearings(mockHearings.filter(h => h.case_id === transformedCase.case_id));


    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCaseAndRelatedData();
  }, [id]);

  useEffect(() => {
    // Fetch all users only when the user is confirmed to be logged in.
    const fetchUsers = async () => {
        if (user) {
            try {
                const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, {
                    credentials: 'include', // Send cookies with the request
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                if (usersResponse.ok) {
                    const usersJson = await usersResponse.json();
                    setAllUsers(usersJson || []);
                } else {
                    console.error('Failed to fetch users');
                }
            } catch (e) {
                console.error('Error fetching users:', e);
            }
        }
    };
    fetchUsers();
  }, [user]); // This effect runs when the user object changes.

  useEffect(() => {
    // Once allUsers are fetched and caseData exists, link the lawyer.
    if (caseData && allUsers.length > 0) {
        const lawyer = allUsers.find((u: User) => u.id === caseData.lawyer_id);
        setCaseData(currentCaseData => 
            currentCaseData ? { ...currentCaseData, lawyer } : null
        );
        setCaseTasks(currentTasks => currentTasks.map(task => ({
          ...task,
          assignee: allUsers.find(u => u.id === task.assigned_to_id)
        })));
    }
  }, [caseData?.id, allUsers]); // Reruns if caseData changes or users are loaded.


  const handleHearingScheduled = (newHearing: Hearing) => {
    setCaseHearings(prev => [...prev, newHearing].sort((a,b) => b.date.getTime() - a.date.getTime()));
  }

  const handleDocumentUploaded = () => {
    // Re-fetch to get the latest list from the server
    fetchCaseAndRelatedData();
  };
  
  const handleTaskAction = () => {
    // Refetch all data to ensure tasks list is up to date
    fetchCaseAndRelatedData();
  }

  useEffect(() => {
    setAnalysis(null);
    setExtractedText(null);
  }, [selectedDocId]);

  const handleAnalyzeDocument = async () => {
    if (!selectedDocId) {
      toast({
        title: "No Document Selected",
        description: "Please select a document from the list to analyze.",
        variant: "destructive",
      });
      return;
    }
  
    const documentToAnalyze = caseDocs.find(doc => String(doc.id) === selectedDocId);
    if (!documentToAnalyze || !caseData) {
      toast({
        title: "Analysis Not Possible",
        description: "The selected document or case could not be found.",
        variant: "destructive",
      });
      return;
    }
  
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    setExtractedText(null);
  
    try {
      // 1. Fetch the text content from the backend
      const textResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/extract_text/case_${caseData.id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
  
      if (!textResponse.ok) {
        throw new Error(`Failed to extract text. Status: ${textResponse.status}`);
      }
  
      const textData = await textResponse.json();
      const documentText = textData.documents?.[documentToAnalyze.filename];
      setExtractedText(documentText || 'No text could be extracted from this document.');
  
      if (!documentText) {
        throw new Error(`Could not find text for "${documentToAnalyze.filename}" in the response.`);
      }
      
      if (documentText.startsWith('[Unsupported file type]')) {
        toast({
            title: "Unsupported File",
            description: `Cannot analyze this file type. Please select a PDF or TXT file.`,
            variant: "destructive"
        });
        setIsLoadingAnalysis(false);
        return;
      }
  
      // 2. Send the extracted text to the AI for analysis
      const result = await analyzeLegalDocumentAction({ documentText });
  
      if (result.error) {
        throw new Error(result.error);
      } else if (result.analysis) {
        setAnalysis(result.analysis);
        toast({
          title: "Analysis Complete",
          description: `Analysis for "${documentToAnalyze.filename}" is ready.`,
        });
      }
    } catch (error: any) {
      setExtractedText(`An error occurred while extracting text: ${error.message}`);
      toast({
        title: "Error During Analysis",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleScheduleMeeting = () => {
    if (!caseData?.client || !caseData.client.email) return;

    const eventTitle = `Meeting: ${caseData.title}`;
    const eventDetails = `Discussion regarding case: ${caseData.title}\nCase ID: ${caseData.case_id}`;
    
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', eventTitle);
    url.searchParams.set('details', eventDetails);
    url.searchParams.set('add', `${caseData.client.email}`);
    url.searchParams.set('crm', 'true'); // Automatically add conference call (Google Meet)

    window.open(url.toString(), '_blank');
  };

  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!caseData) return;
    
    const result = await updateCaseStatusAction(caseData.case_id, newStatus);
    
    if (result.error) {
      toast({
        title: "Error Updating Status",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.case) {
      setCaseData(prev => prev ? {...prev, status: newStatus } : null);
      toast({
        title: "Status Updated",
        description: `Case status has been changed to "${newStatus}".`,
      });
    }
  }

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;

    const result = await deleteDocumentAction(docToDelete.id);

    if (result.error) {
      toast({
        title: "Error Deleting Document",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Document Deleted",
        description: `"${docToDelete.filename}" has been successfully deleted.`,
      });
      setCaseDocs(prev => prev.filter(d => d.id !== docToDelete.id));
      if (selectedDocId === String(docToDelete.id)) {
        setSelectedDocId(null);
      }
    }
    setDocToDelete(null); // Close the dialog
  };


  if (isLoading) {
    return <CaseDetailSkeleton />;
  }

  if (error) {
     return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Case</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
     )
  }

  if (!caseData) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document{' '}
              <strong>&quot;{docToDelete?.filename}&quot;</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <strong>Client:</strong> {caseData.client?.name}
                  <Button variant="outline" size="sm" onClick={handleScheduleMeeting}>
                    <Video className="mr-2 h-4 w-4" /> Schedule Meeting
                  </Button>
                </div>
                <div><strong>Lead Lawyer:</strong> {caseData.lawyer?.name || 'N/A'}</div>
                <div><strong>Filing Date:</strong> {caseData.filing_date.toLocaleDateString()}</div>
                <div className="flex items-center gap-2">
                  <strong>Status:</strong> 
                  <Select value={caseData.status} onValueChange={(value: CaseStatus) => handleStatusChange(value)}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                  <div>
                  <strong>Type:</strong> <Badge variant="secondary" className="capitalize">{caseData.case_type}</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{caseData.description || 'No description provided.'}</p>
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
                    <CardDescription>Select a document to analyze or click its title to preview.</CardDescription>
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
                        <TableHead>Filename</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caseDocs.map(doc => {
                        const fileType = doc.filename.split('.').pop()?.toLowerCase() || 'file';
                        return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <RadioGroupItem value={String(doc.id)} id={String(doc.id)} />
                          </TableCell>
                          <TableCell className="font-medium">
                             <Label htmlFor={String(doc.id)} className="cursor-pointer hover:underline" asChild>
                               <Link href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/document/${doc.id}/preview`} target="_blank" rel="noopener noreferrer">
                                {doc.filename}
                               </Link>
                             </Label>
                          </TableCell>
                          <TableCell className="uppercase text-muted-foreground">
                            <Badge variant="outline">{fileType}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                             <Button variant="ghost" size="sm" asChild>
                               <Link href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/document/${doc.id}`}>
                                  Download
                               </Link>
                             </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDocToDelete(doc)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                          </TableCell>
                        </TableRow>
                      )})}
                      {caseDocs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <FileText className="h-8 w-8" />
                                <span>No documents found for this case.</span>
                                <UploadDocumentDialog 
                                  caseId={caseData.case_id} 
                                  onDocumentUploaded={handleDocumentUploaded}
                                >
                                  <Button size="sm" variant="secondary">
                                    <Upload className="mr-2 h-4 w-4"/> Upload First Document
                                  </Button>
                                </UploadDocumentDialog>
                            </div>
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

                 {(isLoadingAnalysis || extractedText) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-base">
                          <BookText className="h-5 w-5" />
                          Extracted Text
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingAnalysis && !extractedText ? (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                            {extractedText}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

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
                        <TableCell>{hearing.date.toLocaleDateString()}</TableCell>
                        <TableCell>{hearing.date.toLocaleTimeString()}</TableCell>
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
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="font-headline">Associated Tasks</CardTitle>
                <AddTaskDialog cases={[caseData]} defaultCaseId={String(caseData.id)} onTaskAdded={handleTaskAction} allUsers={allUsers}>
                    <Button size="sm"><FilePlus2 className="mr-2 h-4 w-4"/> Add Task</Button>
                </AddTaskDialog>
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
                      return (
                       <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.assignee?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={task.status === 'Done' ? 'outline' : 'default'} className="capitalize">{task.status}</Badge>
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
