"use client";

import { Wand2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { LegalDocumentAnalysisOutput } from "@/ai/flows/intelligent-document-summary";

interface DocumentAnalysisProps {
    isLoading: boolean;
    analysis: LegalDocumentAnalysisOutput | null;
}

export function DocumentAnalysis({ isLoading, analysis }: DocumentAnalysisProps) {
  
  if (isLoading) {
    return (
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
    );
  }

  if (!analysis) {
     return (
        <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">The document analysis will appear here once generated.</p>
            </CardContent>
          </Card>
     )
  }

  return (
    <div className="space-y-4 pt-4">
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
    </div>
  );
}
