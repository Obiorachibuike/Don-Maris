
'use server';

/**
 * @fileOverview Provides general advice on suitable products based on a phone model and component type.
 *
 * - getAccessoryRecommendations - A function that returns product recommendations as a text description.
 * - AccessoryRecommendationsInput - The input type for the getAccessoryRecommendations function.
 * - AccessoryRecommendationsOutput - The return type for the getAccessoryRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccessoryRecommendationsInputSchema = z.object({
  phoneModel: z.string().describe('The user’s phone model.'),
  productType: z.string().describe('The type of component the user is looking for (e.g., Screen, Charging Flex).'),
});
export type AccessoryRecommendationsInput = z.infer<typeof AccessoryRecommendationsInputSchema>;

const AccessoryRecommendationsOutputSchema = z.object({
  recommendationsText: z.string().describe('A descriptive text of suitable products or models for the given phone.'),
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
  prompt: `You are an expert on phone parts and accessories. A user is looking for a specific component for their phone. 
Based on your knowledge of the public internet, provide a helpful description of what kind of product models or types they should be looking for. Do not mention specific brands unless it is essential for compatibility.

Phone Model: {{{phoneModel}}}
Component Type: {{{productType}}}

Provide your answer in the 'recommendationsText' field.
`,
});

const accessoryRecommendationsFlow = ai.defineFlow(
  {
    name: 'accessoryRecommendationsFlow',
    inputSchema: AccessoryRecommendationsInputSchema,
    outputSchema: AccessoryRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

