'use server';

/**
 * @fileOverview An intelligent document summarization AI agent.
 *
 * - generateDocumentSummary - A function that generates a summary of a document.
 * - GenerateDocumentSummaryInput - The input type for the generateDocumentSummary function.
 * - GenerateDocumentSummaryOutput - The return type for the generateDocumentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentSummaryInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be summarized.'),
});
export type GenerateDocumentSummaryInput = z.infer<typeof GenerateDocumentSummaryInputSchema>;

const GenerateDocumentSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document.'),
});
export type GenerateDocumentSummaryOutput = z.infer<typeof GenerateDocumentSummaryOutputSchema>;

export async function generateDocumentSummary(
  input: GenerateDocumentSummaryInput
): Promise<GenerateDocumentSummaryOutput> {
  return generateDocumentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentSummaryPrompt',
  input: {schema: GenerateDocumentSummaryInputSchema},
  output: {schema: GenerateDocumentSummaryOutputSchema},
  prompt: `You are an expert legal summarizer.

  Summarize the following legal document in a concise and informative manner.

  Document Text: {{{documentText}}}`,
});

const generateDocumentSummaryFlow = ai.defineFlow(
  {
    name: 'generateDocumentSummaryFlow',
    inputSchema: GenerateDocumentSummaryInputSchema,
    outputSchema: GenerateDocumentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
