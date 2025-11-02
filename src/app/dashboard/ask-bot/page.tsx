'use client';

import { useState, useMemo } from 'react';
import { Bot, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askLegalAssistantAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { mockDocuments } from '@/lib/mock-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Document } from '@/lib/types';


interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function AskBotPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMessage: Message = { sender: 'user', text: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuestion('');

    const selectedDocuments = mockDocuments.filter(doc => selectedDocIds.has(doc.doc_id) && doc.summary);
    
    if (selectedDocuments.length === 0) {
       toast({
        title: 'No Documents Selected',
        description: 'Please select at least one document to provide context for your question.',
        variant: 'destructive',
      });
      const errorMessage: Message = { sender: 'bot', text: "I can't answer without any document context. Please select one or more documents first." };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      return;
    }

    const result = await askLegalAssistantAction({
      question,
      documents: selectedDocuments.map(d => ({ title: d.title, content: d.summary! }))
    });
    
    setIsLoading(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
      const errorMessage: Message = { sender: 'bot', text: "Sorry, I couldn't process your request." };
      setMessages(prev => [...prev, errorMessage]);
    } else if (result.answer) {
      const botMessage: Message = { sender: 'bot', text: result.answer };
      setMessages(prev => [...prev, botMessage]);
    }
  };
  
  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const relevantDocuments = useMemo(() => mockDocuments.filter(doc => doc.summary), []);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] gap-4">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Bot /> Nyayadeep AI Assistant
                </CardTitle>
                <CardDescription>
                Your intelligent legal research partner. Select documents below and ask a question about them.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span>{selectedDocIds.size > 0 ? `${selectedDocIds.size} document(s) selected` : 'Select Documents for Context'}</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                         <ScrollArea className="h-72">
                            <div className="p-4 space-y-4">
                            {relevantDocuments.length > 0 ? relevantDocuments.map(doc => (
                                <div key={doc.doc_id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={doc.doc_id}
                                    checked={selectedDocIds.has(doc.doc_id)}
                                    onCheckedChange={() => toggleDocumentSelection(doc.doc_id)}
                                />
                                <Label htmlFor={doc.doc_id} className="font-normal cursor-pointer flex-1">
                                    <p className="font-medium">{doc.title}</p>
                                    <p className="text-xs text-muted-foreground">{doc.case_title}</p>
                                </Label>
                                </div>
                            )) : (
                                <p className="text-sm text-center text-muted-foreground py-4">No documents with content available for analysis.</p>
                            )}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
        <Card className="flex flex-col flex-1">
        <CardContent className="flex-1 overflow-y-auto pr-4 space-y-6 pt-6">
            {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'bot' && (
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                )}
                <div className={`rounded-lg p-3 max-w-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.sender === 'user' && (
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                )}
            </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-4">
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted w-full max-w-lg">
                    <div className="space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
                </div>
            )}

            {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground pt-16">
                <FileText className="mx-auto h-12 w-12 mb-4"/>
                <p>Select documents and ask a question to get started.</p>
                <p className="text-xs">e.g., "Summarize the plaintiff's primary claims."</p>
                </div>
            )}

        </CardContent>
        <div className="p-4 border-t">
            <div className="relative">
            <Textarea
                placeholder="Type your question about the selected documents..."
                className="pr-20"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAsk();
                    }
                }}
                disabled={isLoading}
            />
            <Button
                type="submit"
                size="sm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                onClick={handleAsk}
                disabled={isLoading}
            >
                {isLoading ? 'Asking...' : 'Ask'}
            </Button>
            </div>
        </div>
        </Card>
    </div>
  );
}
