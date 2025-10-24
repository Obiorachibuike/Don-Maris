
'use server';

/**
 * @fileOverview Finds suitable products from the database based on a phone model and component type.
 *
 * - getAccessoryRecommendations - A function that returns product recommendations.
 * - AccessoryRecommendationsInput - The input type for the getAccessoryRecommendations function.
 * - AccessoryRecommendationsOutput - The return type for the getAccessoryRecommendations function.
 */

import {ai} from '@/ai/genkit';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import {z} from 'genkit';

const AccessoryRecommendationsInputSchema = z.object({
  phoneModel: z.string().describe('The user’s phone model.'),
  productType: z.string().describe('The type of component the user is looking for (e.g., Screen, Charging Flex).'),
});
export type AccessoryRecommendationsInput = z.infer<typeof AccessoryRecommendationsInputSchema>;

const AccessoryRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.custom<Product>()).describe('A list of recommended products from the database.'),
});
export type AccessoryRecommendationsOutput = z.infer<typeof AccessoryRecommendationsOutputSchema>;

const findProductsTool = ai.defineTool(
    {
        name: 'findProducts',
        description: 'Search for products in the database based on search query and category.',
        inputSchema: z.object({ 
            query: z.string().describe('A search query to match against product names and descriptions. This should include the phone model.'),
            category: z.string().optional().describe('The category to filter by (e.g., Screen, Tools).'),
         }),
        outputSchema: z.array(z.custom<Product>()),
    },
    async ({ query, category }) => {
        let products = await getProducts();
        
        const lowerCaseQuery = query.toLowerCase();
        products = products.filter(p => 
            p.name.toLowerCase().includes(lowerCaseQuery) || 
            p.description.toLowerCase().includes(lowerCaseQuery) ||
            p.longDescription.toLowerCase().includes(lowerCaseQuery)
        );

        if (category) {
            products = products.filter(p => p.type === category);
        }
        // Return top 5 matches
        return products.slice(0, 5);
    }
);


export async function getAccessoryRecommendations(
  input: AccessoryRecommendationsInput
): Promise<AccessoryRecommendationsOutput> {
  return accessoryRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accessoryRecommendationsPrompt',
  input: {schema: AccessoryRecommendationsInputSchema},
  output: {schema: AccessoryRecommendationsOutputSchema},
  tools: [findProductsTool],
  prompt: `You are an expert at finding the right phone parts. A user is looking for a specific component for their phone. Use the provided tools to find matching products from the database.

Phone Model: {{{phoneModel}}}
Component Type: {{{productType}}}

Use the findProducts tool to search the database. Use the phone model as the primary search query and the component type as the category to filter by. Return the products you find.
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
    // The tool call now directly returns product objects.
    // The model's response will contain the result of the tool call.
    // We need to find the tool output and return it.
    
    // In Genkit v1, the tool output isn't directly in the 'output'. 
    // It seems the model just uses the tool and formulates an answer.
    // Let's call the tool directly as a simplified approach for now.
    const products = await findProductsTool({
      query: input.phoneModel,
      category: input.productType,
    });
    
    return { recommendations: products };
  }
);
