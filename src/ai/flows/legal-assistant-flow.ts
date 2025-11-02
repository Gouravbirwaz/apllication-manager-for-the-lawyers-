'use server';

/**
 * @fileOverview A legal assistant AI agent that performs RAG.
 *
 * - askLegalAssistant - A function that answers legal questions based on provided documents.
 * - LegalAssistantInput - The input type for the askLegalAssistant function.
 * - LegalAssistantOutput - The return type for the askLegalAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalAssistantInputSchema = z.object({
  question: z.string().describe('The legal question to be answered.'),
  documents: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })).describe('An array of document contents to use as context for the answer.')
});
export type LegalAssistantInput = z.infer<typeof LegalAssistantInputSchema>;

const LegalAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the legal question.'),
});
export type LegalAssistantOutput = z.infer<typeof LegalAssistantOutputSchema>;

export async function askLegalAssistant(
  input: LegalAssistantInput
): Promise<LegalAssistantOutput> {
  return legalAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalAssistantPrompt',
  input: {schema: LegalAssistantInputSchema},
  output: {schema: LegalAssistantOutputSchema},
  prompt: `You are an expert legal AI assistant named Nyayadeep. Your purpose is to provide precise, formal, and well-structured legal information to lawyers in India.

Your primary goal is to answer the user's question based *only* on the content of the documents provided below. Do not use outside knowledge. If the answer cannot be found in the documents, state that clearly.

When responding to the legal question:
1.  Base your answer strictly on the provided document context.
2.  If you reference information from a specific document, cite it by its title (e.g., "[Initial Complaint Filing]").
3.  Structure your answers logically. Use headings or bullet points for clarity.
4.  If the question is ambiguous or lacks necessary detail, ask clarifying questions to ensure you can provide an accurate response.
5.  Conclude with a disclaimer stating that you are an AI assistant and your response should not be considered a substitute for professional legal advice.

Here are the documents to use as context:
{{#each documents}}
---
DOCUMENT TITLE: {{title}}
CONTENT:
{{{content}}}
---
{{/each}}

User's Question: {{{question}}}`,
});

const legalAssistantFlow = ai.defineFlow(
  {
    name: 'legalAssistantFlow',
    inputSchema: LegalAssistantInputSchema,
    outputSchema: LegalAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
