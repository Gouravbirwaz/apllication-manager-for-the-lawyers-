"use server";

import { generateDocumentSummary as generateDocumentSummaryFlow, GenerateDocumentSummaryInput } from "@/ai/flows/intelligent-document-summary";

export async function generateDocumentSummaryAction(input: GenerateDocumentSummaryInput): Promise<{ summary: string } | { error: string }> {
  try {
    const output = await generateDocumentSummaryFlow(input);
    return { summary: output.summary };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to generate summary." };
  }
}
