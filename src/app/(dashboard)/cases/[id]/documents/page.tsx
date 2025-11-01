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
import { mockCases, mockDocuments } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { Document } from "@/lib/types";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";

export default function CaseDocumentsPage({ params }: { params: { id: string } }) {
  const [isClient, setIsClient] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  
  useEffect(() => {
    setIsClient(true);
    setCaseId(params.id);
  }, [params.id]);

  const caseData = mockCases.find((c) => c.case_id === caseId);

  const [caseDocs, setCaseDocs] = useState<Document[]>([]);

  useEffect(() => {
    if (caseId) {
      setCaseDocs(mockDocuments.filter((d) => d.case_id === caseId));
    }
  }, [caseId]);

  if (!isClient) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  if (!caseData) {
    notFound();
  }

  const handleDocumentUploaded = (newDocument: Document) => {
    setCaseDocs(prev => [newDocument, ...prev]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-2xl">Documents: {caseData.title}</CardTitle>
            <CardDescription>
                A structured view of all documents for this case.
            </CardDescription>
        </div>
        <UploadDocumentDialog 
          caseId={caseData.case_id} 
          onDocumentUploaded={handleDocumentUploaded} 
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {caseDocs.map(doc => (
              <TableRow key={doc.doc_id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell className="uppercase">{doc.file_type}</TableCell>
                <TableCell>{isClient ? doc.uploaded_at.toLocaleDateString() : '...'}</TableCell>
                <TableCell>{doc.version}</TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
            {caseDocs.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No documents found for this case.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
