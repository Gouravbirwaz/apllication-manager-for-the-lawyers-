'use server';

/**
 * @fileOverview A legal assistant AI agent.
 *
 * - askLegalAssistant - A function that answers legal questions.
 * - LegalAssistantInput - The input type for the askLegalAssistant function.
 * - LegalAssistantOutput - The return type for the askLegalAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalAssistantInputSchema = z.object({
  question: z.string().describe('The legal question to be answered.'),
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

Your tone must be professional and authoritative.

When responding to a legal question:
1.  Always reference the relevant sections of Indian law, including acts, codes, and established legal precedents.
2.  Structure your answers logically. Use headings or bullet points for clarity where appropriate.
3.  If a question is ambiguous or lacks necessary detail, ask clarifying questions to ensure you can provide an accurate response. Do not make assumptions.
4.  Conclude with a disclaimer stating that you are an AI assistant and your response should not be considered a substitute for professional legal advice.

Question: {{{question}}}`,
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
