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
  prompt: `You are an expert legal AI assistant named Nyayadeep. Your purpose is to assist lawyers in India.

  Answer the following legal question clearly and concisely, referencing Indian law where applicable.

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
