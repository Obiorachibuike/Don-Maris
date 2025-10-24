
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getRecommendationsAction, type RecommendationState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sparkles, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { ProductType } from '@/lib/types';

const initialState: RecommendationState = {};

const productTypes: (ProductType | 'Touch Pad')[] = ['Power Flex', 'Charging Flex', 'Screen', 'Backglass', 'Glass', 'Tools', 'Machine', 'Touch Pad'];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Finding Recommendations...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get Recommendations
        </>
      )}
    </Button>
  );
}

export function RecommendationsClientPage() {
  const [state, formAction] = useActionState(getRecommendationsAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-center font-headline">Find Your Perfect Match</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="phoneModel" className="text-sm font-medium">Phone Model</label>
            <Input
              id="phoneModel"
              name="phoneModel"
              placeholder="e.g., iPhone 15 Pro, Samsung S24"
              required
            />
          </div>
          <div className="space-y-2">
             <label htmlFor="productType" className="text-sm font-medium">Component Type</label>
             <Select name="productType" required>
                <SelectTrigger id="productType">
                    <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                    {productTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <SubmitButton />
          </div>
        </form>

        {state.recommendationsText && (
           <div className="mt-8">
            <h3 className="text-xl font-bold text-center mb-4 font-headline flex items-center justify-center gap-2">
              <CheckCircle className="text-green-500" />
              Here's what our AI suggests!
            </h3>
            <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-6 bg-muted rounded-md">
                <p>{state.recommendationsText}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
