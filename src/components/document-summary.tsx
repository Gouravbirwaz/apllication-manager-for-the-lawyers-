"use client";

import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateDocumentSummaryAction } from "@/app/actions";
import { Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";

export function DocumentSummary({ initialSummary }: { initialSummary?: string }) {
  const [documentText, setDocumentText] = useState("");
  const [summary, setSummary] = useState(initialSummary || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste some document text to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSummary("");

    const result = await generateDocumentSummaryAction({ documentText });

    setIsLoading(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.summary) {
      setSummary(result.summary);
      toast({
        title: "Summary Generated",
        description: "The document summary has been successfully created.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste a long passage from a legal document here..."
        className="min-h-[150px] font-body"
        value={documentText}
        onChange={(e) => setDocumentText(e.target.value)}
        disabled={isLoading}
      />
      <Button onClick={handleGenerateSummary} disabled={isLoading}>
        <Wand2 className="mr-2 h-4 w-4" />
        {isLoading ? "Generating..." : "Generate Summary"}
      </Button>

      <div className="space-y-2 pt-4">
        <h4 className="font-semibold font-headline text-lg">Generated Summary</h4>
        <Card className="min-h-[100px]">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : summary ? (
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">The generated summary will appear here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
