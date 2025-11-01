'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Document } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface UploadDocumentDialogProps {
  caseId: string;
  onDocumentUploaded: (document: Document) => void;
}

export function UploadDocumentDialog({ caseId, onDocumentUploaded }: UploadDocumentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and select a file.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fileType = file.name.split('.').pop() as 'pdf' | 'docx' | 'image';
    const newDocument: Document = {
      doc_id: `doc-${Date.now()}`,
      case_id: caseId,
      title: title,
      file_url: '#', // Placeholder URL
      file_type: ['pdf', 'docx', 'image'].includes(fileType) ? fileType : 'pdf',
      uploaded_at: new Date(),
      version: 1,
      uploaded_by: mockUsers.find(u => u.role === 'lawyer')?.uid || 'user-lawyer-1',
    };
    
    setIsUploading(false);
    onDocumentUploaded(newDocument);
    
    toast({
      title: 'Upload Successful',
      description: `"${newDocument.title}" has been added to the case.`,
    });
    
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Select a file and give it a title to add it to the case.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Document Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Plaintiff's Affidavit"
              disabled={isUploading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="col-span-3 file:text-primary file:font-medium"
              disabled={isUploading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload & Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
