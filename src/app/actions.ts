
'use server';

import { getAccessoryRecommendations } from '@/ai/flows/accessory-recommendations';
import { chatAboutProduct, type ProductChatInput } from '@/ai/flows/product-chat';
import type { Product } from '@/lib/types';
import { z } from 'zod';

const recommendationSchema = z.object({
  phoneModel: z.string().min(1, { message: 'Phone model cannot be empty.' }),
  productType: z.string().min(1, { message: 'Please select a product type.' }),
});

export type RecommendationState = {
  recommendationsText?: string;
  error?: string;
}

export async function getRecommendationsAction(
  prevState: RecommendationState,
  formData: FormData
): Promise<RecommendationState> {
  const validatedFields = recommendationSchema.safeParse({
    phoneModel: formData.get('phoneModel'),
    productType: formData.get('productType'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      error: fieldErrors.phoneModel?.[0] || fieldErrors.productType?.[0],
    };
  }

  try {
    const result = await getAccessoryRecommendations({ 
        phoneModel: validatedFields.data.phoneModel,
        productType: validatedFields.data.productType,
    });
    
    if (result.recommendationsText) {
      return { recommendationsText: result.recommendationsText };
    }
    return { error: 'Could not find any recommendations for this model.' };

  } catch (e: any) {
    console.error(e);
    const errorMessage = e.message || 'An unexpected error occurred. Please try again.';
    return { error: errorMessage };
  }
}

export async function chatWithProductAI(input: ProductChatInput) {
    try {
        const result = await chatAboutProduct(input);
        return { success: true, response: result.response };
    } catch (e: any) {
        console.error(e);
        const errorMessage = e.message || 'An unexpected error occurred. Please try again.';
        return { success: false, error: errorMessage };
    }
}

