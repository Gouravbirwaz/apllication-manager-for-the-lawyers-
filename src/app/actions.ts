"use server";

import { analyzeLegalDocument as analyzeLegalDocumentFlow, LegalDocumentAnalysisInput, LegalDocumentAnalysisOutput } from "@/ai/flows/intelligent-document-summary";
import { askLegalAssistant as askLegalAssistantFlow, LegalAssistantInput } from "@/ai/flows/legal-assistant-flow";

export async function analyzeLegalDocumentAction(input: LegalDocumentAnalysisInput): Promise<{ analysis: LegalDocumentAnalysisOutput } | { error: string }> {
  try {
    const output = await analyzeLegalDocumentFlow(input);
    return { analysis: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to generate analysis." };
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
