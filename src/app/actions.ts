
'use server';

import { getAccessoryRecommendations } from '@/ai/flows/accessory-recommendations';
import { chatAboutProduct, type ProductChatInput } from '@/ai/flows/product-chat';
import { z } from 'zod';

const schema = z.object({
  phoneModel: z.string().min(1, { message: 'Phone model cannot be empty.' }),
});

export type RecommendationState = {
  recommendations?: string[];
  error?: string;
}

export async function getRecommendationsAction(
  prevState: RecommendationState,
  formData: FormData
): Promise<RecommendationState> {
  const validatedFields = schema.safeParse({
    phoneModel: formData.get('phoneModel'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.phoneModel?.[0],
    };
  }

  try {
    const result = await getAccessoryRecommendations({ phoneModel: validatedFields.data.phoneModel });
    if (result.recommendations && result.recommendations.length > 0) {
      return { recommendations: result.recommendations };
    }
    return { error: 'Could not find any recommendations for this model.' };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function chatWithProductAI(input: ProductChatInput) {
    try {
        const result = await chatAboutProduct(input);
        return { success: true, response: result.response };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}
