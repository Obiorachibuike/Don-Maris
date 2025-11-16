'use server';

/**
 * @fileOverview Provides AI-driven explanations and recommendations for error messages.
 *
 * - getErrorExplanation - A function that returns a simplified explanation and a suggested fix for a given error message.
 * - ErrorExplainerInput - The input type for the getErrorExplanation function.
 * - ErrorExplainerOutput - The return type for the getErrorExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ErrorExplainerInputSchema = z.object({
  errorMessage: z.string().describe('The error message to be explained.'),
  context: z.string().optional().describe('Optional context about where the error occurred (e.g., component name, API route).'),
});
export type ErrorExplainerInput = z.infer<typeof ErrorExplainerInputSchema>;

const ErrorExplainerOutputSchema = z.object({
  explanation: z.string().describe('A simple, user-friendly explanation of what the error means in 1-2 sentences.'),
  recommendation: z.string().describe('A concise, actionable recommendation on how to fix the error in 1-2 sentences.'),
});
export type ErrorExplainerOutput = z.infer<typeof ErrorExplainerOutputSchema>;

export async function getErrorExplanation(
  input: ErrorExplainerInput
): Promise<ErrorExplainerOutput> {
  return errorExplainerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'errorExplainerPrompt',
  input: { schema: ErrorExplainerInputSchema },
  output: { schema: ErrorExplainerOutputSchema },
  prompt: `You are an expert developer assistant. Your task is to explain a technical error message in a simple, easy-to-understand way and provide a clear, actionable recommendation for a fix. Keep your answers very concise (1-2 sentences each).

Error Message: "{{{errorMessage}}}"
{{#if context}}
Context: The error occurred in {{{context}}}.
{{/if}}

Provide the explanation and recommendation in the specified output format. Do not add any extra conversational text.
`,
});

const errorExplainerFlow = ai.defineFlow(
  {
    name: 'errorExplainerFlow',
    inputSchema: ErrorExplainerInputSchema,
    outputSchema: ErrorExplainerOutputSchema,
  },
  async (input) => {
    // In a real-world scenario, you might add logic here to check for common errors
    // and provide canned responses to save on API calls.
    const { output } = await prompt(input);
    return output!;
  }
);
