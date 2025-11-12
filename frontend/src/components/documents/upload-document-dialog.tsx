
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
import { useToast } from '@/hooks/use-toast';
import type { Document } from '@/lib/types';
import { uploadDocumentsAction } from '@/app/actions';

interface UploadDocumentDialogProps {
  caseId: string;
  onDocumentUploaded: (document?: any) => void;
  children: React.ReactNode;
}

export function UploadDocumentDialog({ caseId, onDocumentUploaded, children }: UploadDocumentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select one or more files to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('documents', files[i]);
    }

    const result = await uploadDocumentsAction(caseId, formData);
    
    setIsUploading(false);

    if (result.error) {
        toast({
            title: 'Upload Failed',
            description: result.error,
            variant: 'destructive',
        });
    } else {
        toast({
            title: 'Upload Successful',
            description: `${result.files?.length || 0} document(s) have been added to the case.`,
        });
        onDocumentUploaded();
        setIsOpen(false);
        resetForm();
    }
  };

  const resetForm = () => {
    setFiles(null);
    const fileInput = document.getElementById('files') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Select one or more files to add to this case. The filename will be used as the document title.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="files" className="text-right">
              Files
            </Label>
            <Input
              id="files"
              type="file"
              multiple
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
