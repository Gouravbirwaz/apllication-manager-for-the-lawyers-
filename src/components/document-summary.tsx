"use client";

import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeLegalDocumentAction } from "@/app/actions";
import { Wand2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";
import type { LegalDocumentAnalysisOutput } from "@/ai/flows/intelligent-document-summary";

export function DocumentSummary({ initialSummary }: { initialSummary?: string }) {
  const [documentText, setDocumentText] = useState(initialSummary || "");
  const [analysis, setAnalysis] = useState<LegalDocumentAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateAnalysis = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste some document text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    const result = await analyzeLegalDocumentAction({ documentText });

    setIsLoading(false);

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
        description: "The document has been successfully analyzed.",
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
      <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
        <Wand2 className="mr-2 h-4 w-4" />
        {isLoading ? "Analyzing..." : "Analyze Document"}
      </Button>

      <div className="space-y-4 pt-4">
        <h4 className="font-semibold font-headline text-lg">Legal Analysis</h4>
        {isLoading ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
               <Skeleton className="h-6 w-1/3" />
               <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        ) : analysis ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-500/50">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg font-headline text-green-500">Positive Aspects</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {analysis.positiveAspects.map((point, index) => (
                    <li key={`pos-${index}`}>{point}</li>
                  ))}
                   {analysis.positiveAspects.length === 0 && <li>No specific positive aspects identified.</li>}
                </ul>
              </CardContent>
            </Card>
             <Card className="border-red-500/50">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg font-headline text-red-500">Negative Aspects</CardTitle>
              </CardHeader>
              <CardContent>
                 <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {analysis.negativeAspects.map((point, index) => (
                    <li key={`neg-${index}`}>{point}</li>
                  ))}
                   {analysis.negativeAspects.length === 0 && <li>No specific negative aspects identified.</li>}
                </ul>
              </CardContent>
            </Card>
           </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">The document analysis will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
