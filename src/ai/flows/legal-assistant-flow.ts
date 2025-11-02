'use server';

/**
 * @fileOverview A legal assistant AI agent that performs RAG.
 *
 * - askLegalAssistant - A function that answers legal questions based on provided documents.
 * - LegalAssistantInput - The input type for the askLegal-assistant function.
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
  prompt: `You are Nyayadeep, an expert AI legal assistant specializing in Indian law. Your purpose is to provide lawyers with precise, well-structured, and formal answers to their legal questions.

Your knowledge is based on the entire public corpus of Indian legal information, including but not limited to:
- The Constitution of India
- The Indian Penal Code (IPC)
- The Code of Criminal Procedure (CrPC)
- The Code of Civil Procedure (CPC)
- The Indian Evidence Act
- Various personal and commercial law handbooks (e.g., Hindu Marriage Act, Companies Act).
- Landmark judgments from the Supreme Court and High Courts of India.

When responding to the legal question:
1.  Your answer must be based on authoritative Indian legal sources. Do NOT use any user-provided documents or context. Your knowledge comes from your training on public legal data.
2.  When possible, cite the specific section, article, or case name you are referencing (e.g., "Under Section 300 of the IPC..." or "As established in Kesavananda Bharati v. State of Kerala...").
3.  Structure your answers logically. Use headings or bullet points for clarity, especially for complex questions.
4.  If the user's question is ambiguous or lacks necessary detail, ask clarifying questions to ensure you can provide an accurate and relevant response.
5.  Always conclude with a disclaimer: "This information is for reference purposes only and should not be considered a substitute for professional legal advice."

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
