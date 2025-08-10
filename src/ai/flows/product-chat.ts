
'use server';

/**
 * @fileOverview A conversational AI agent for product inquiries.
 *
 * - chatAboutProduct - A function that handles chatting about a specific product.
 * - ProductChatInput - The input type for the chatAboutProduct function.
 * - ProductChatOutput - The return type for the chatAboutProduct function.
 */

import { ai } from '@/ai/genkit';
import { getProductById, getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { z } from 'genkit';

const ProductChatInputSchema = z.object({
  productId: z.string().optional().describe('The ID of the product the user is currently viewing.'),
  question: z.string().describe("The user's question about the product."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The history of the conversation so far.'),
});
export type ProductChatInput = z.infer<typeof ProductChatInputSchema>;

const ProductChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user’s question.'),
});
export type ProductChatOutput = z.infer<typeof ProductChatOutputSchema>;


const getProductInfoTool = ai.defineTool(
    {
        name: 'getProductInfo',
        description: 'Get detailed information for a specific product by its ID.',
        inputSchema: z.object({ id: z.string() }),
        outputSchema: z.custom<Product>(),
    },
    async ({ id }) => {
        return getProductById(id);
    }
);

const findSimilarProductsTool = ai.defineTool(
    {
        name: 'findSimilarProducts',
        description: 'Find products that are similar to the one being viewed, or recommend accessories. Use this to answer questions about other products or recommendations.',
        inputSchema: z.object({ 
            category: z.string().optional().describe('The category to search for (e.g., Case, Charger).'),
            brand: z.string().optional().describe('The brand to search for.'),
         }),
        outputSchema: z.array(z.custom<Product>()),
    },
    async ({ category, brand }) => {
        let products = getProducts();
        if (category) {
            products = products.filter(p => p.type === category);
        }
        if (brand) {
            products = products.filter(p => p.brand === brand);
        }
        // Return a few matches
        return products.slice(0, 3);
    }
);

export async function chatAboutProduct(input: ProductChatInput): Promise<ProductChatOutput> {
    return productChatFlow(input);
}

const prompt = ai.definePrompt({
    name: 'productChatPrompt',
    input: { schema: ProductChatInputSchema },
    output: { schema: ProductChatOutputSchema },
    tools: [getProductInfoTool, findSimilarProductsTool],
    prompt: `You are a friendly and knowledgeable shopping assistant for Don Maris Accessories. Your goal is to help users with their questions about products.
{{#if productId}}
- The user is currently viewing the product with ID: {{{productId}}}. Use the getProductInfo tool if you need more details about it.
{{else}}
- The user is on the main products page. Help them find products or answer general questions.
{{/if}}
- If the user asks for recommendations or about other products, use the findSimilarProducts tool.
- Keep your answers concise, helpful, and friendly.
- Format responses in Markdown for readability. You can use lists, bold text, etc.
- If you recommend a product, provide its name and price.
- Base your answers ONLY on the information provided by the tools.

User question: {{{question}}}
`,
});

const productChatFlow = ai.defineFlow(
    {
        name: 'productChatFlow',
        inputSchema: ProductChatInputSchema,
        outputSchema: ProductChatOutputSchema,
    },
    async (input) => {
        const history = (input.chatHistory || []).map(msg => ({
            role: msg.role,
            content: [{ text: msg.content }]
        }));

        const { output } = await prompt(
            { ...input },
            {
                history,
            }
        );

        return { response: output!.response };
    }
);
