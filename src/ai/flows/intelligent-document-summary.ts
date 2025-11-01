'use server';

/**
 * @fileOverview An intelligent document analysis AI agent.
 *
 * - analyzeLegalDocument - A function that analyzes a legal document for positive and negative aspects.
 * - LegalDocumentAnalysisInput - The input type for the analyzeLegalDocument function.
 * - LegalDocumentAnalysisOutput - The return type for the analyzeLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalDocumentAnalysisInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to be analyzed.'),
});
export type LegalDocumentAnalysisInput = z.infer<typeof LegalDocumentAnalysisInputSchema>;

const LegalDocumentAnalysisOutputSchema = z.object({
  positiveAspects: z.array(z.string()).describe('Key points, arguments, or evidence in the document that are favorable to our case.'),
  negativeAspects: z.array(z.string()).describe('Key points, arguments, or evidence in the document that are unfavorable or pose a risk to our case.'),
  strategicAdvice: z.array(z.string()).describe('Actionable advice for the lawyer based on the document analysis.'),
});
export type LegalDocumentAnalysisOutput = z.infer<typeof LegalDocumentAnalysisOutputSchema>;

export async function analyzeLegalDocument(
  input: LegalDocumentAnalysisInput
): Promise<LegalDocumentAnalysisOutput> {
  return legalDocumentAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalDocumentAnalysisPrompt',
  input: {schema: LegalDocumentAnalysisInputSchema},
  output: {schema: LegalDocumentAnalysisOutputSchema},
  prompt: `You are a senior advocate in the Indian legal system, known for your sharp analytical skills and strategic insights. Your task is to review a legal document and provide actionable advice to the lawyer handling the case.

Your analysis must be objective and tactical.

1.  **Positive Aspects**: Identify all points, evidence, statements, or legal arguments within the document that can be leveraged to your client's advantage. These are the strengths.
2.  **Negative Aspects**: Identify all weaknesses, risks, unfavorable statements, or arguments that could be used against your client or that weaken your position.
3.  **Strategic Advice**: Based on the positive and negative aspects, provide a concise, actionable list of strategic recommendations for the lawyer. This advice should suggest next steps, areas to focus on, and potential lines of argument.

Present your findings as clear, distinct bullet points under each category.

Document Text to Analyze:
{{{documentText}}}`,
});

const legalDocumentAnalysisFlow = ai.defineFlow(
  {
    name: 'legalDocumentAnalysisFlow',
    inputSchema: LegalDocumentAnalysisInputSchema,
    outputSchema: LegalDocumentAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
