"use server";

import { generateDocumentSummary as generateDocumentSummaryFlow, GenerateDocumentSummaryInput } from "@/ai/flows/intelligent-document-summary";
import { askLegalAssistant as askLegalAssistantFlow, LegalAssistantInput } from "@/ai/flows/legal-assistant-flow";

export async function generateDocumentSummaryAction(input: GenerateDocumentSummaryInput): Promise<{ summary: string } | { error: string }> {
  try {
    const output = await generateDocumentSummaryFlow(input);
    return { summary: output.summary };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to generate summary." };
  }
}

export async function askLegalAssistantAction(input: LegalAssistantInput): Promise<{ answer: string } | { error: string }> {
  try {
    const output = await askLegalAssistantFlow(input);
    return { answer: output.answer };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to get answer from assistant." };
  }
}
