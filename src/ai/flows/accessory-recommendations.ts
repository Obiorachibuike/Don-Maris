'use server';

/**
 * @fileOverview Provides personalized accessory recommendations based on the user's phone model.
 *
 * - getAccessoryRecommendations - A function that returns accessory recommendations.
 * - AccessoryRecommendationsInput - The input type for the getAccessoryRecommendations function.
 * - AccessoryRecommendationsOutput - The return type for the getAccessoryRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccessoryRecommendationsInputSchema = z.object({
  phoneModel: z.string().describe('The user’s phone model.'),
});
export type AccessoryRecommendationsInput = z.infer<typeof AccessoryRecommendationsInputSchema>;

const AccessoryRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of recommended accessories for the phone model.'),
});
export type AccessoryRecommendationsOutput = z.infer<typeof AccessoryRecommendationsOutputSchema>;

export async function getAccessoryRecommendations(
  input: AccessoryRecommendationsInput
): Promise<AccessoryRecommendationsOutput> {
  return accessoryRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accessoryRecommendationsPrompt',
  input: {schema: AccessoryRecommendationsInputSchema},
  output: {schema: AccessoryRecommendationsOutputSchema},
  prompt: `You are an expert in recommending phone accessories. Given the phone model, provide a list of accessories that would enhance the user's experience.

Phone Model: {{{phoneModel}}}

Consider accessories like phone cases, screen protectors, headphones, chargers, car mounts, and any other relevant products.

Return the recommendations as a list of strings.
`,
});

const accessoryRecommendationsFlow = ai.defineFlow(
  {
    name: 'accessoryRecommendationsFlow',
    inputSchema: AccessoryRecommendationsInputSchema,
    outputSchema: AccessoryRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
