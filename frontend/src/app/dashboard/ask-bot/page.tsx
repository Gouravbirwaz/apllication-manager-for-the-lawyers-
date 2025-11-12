'use client';

import { useState } from 'react';
import { Bot, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askLegalAssistantAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function AskBotPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMessage: Message = { sender: 'user', text: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuestion('');

    const result = await askLegalAssistantAction({
      question,
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

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] gap-4">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Bot /> Nyayadeep AI Assistant
                </CardTitle>
                <CardDescription>
                Your intelligent legal research partner. Ask questions about Indian law, statutes, and legal procedures.
                </CardDescription>
            </CardHeader>
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
                <p>Ask a legal question to get started.</p>
                <p className="text-xs">e.g., "What are the grounds for divorce under the Hindu Marriage Act?"</p>
                </div>
            )}

        </CardContent>
        <div className="p-4 border-t">
            <div className="relative">
            <Textarea
                placeholder="Type your legal question here..."
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
