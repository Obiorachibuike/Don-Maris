
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getRecommendationsAction, type RecommendationState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState: RecommendationState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Getting Recommendations...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Find Accessories
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
        <form action={formAction} className="space-y-4">
          <Input
            name="phoneModel"
            placeholder="e.g., iPhone 15 Pro, Samsung Galaxy S24, Google Pixel 8"
            required
            className="text-center"
          />
          <SubmitButton />
        </form>

        {state.recommendations && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-center mb-4 font-headline flex items-center justify-center gap-2">
              <CheckCircle className="text-green-500" />
              Recommendations Found!
            </h3>
            <ul className="space-y-2">
              {state.recommendations.map((rec, index) => (
                <li key={index} className="p-3 bg-muted rounded-md text-center">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
