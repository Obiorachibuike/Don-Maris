
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AnimatedSection } from '@/components/animated-section';

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', values);
      toast({
        title: 'Check Your Email',
        description: 'If an account with that email exists, we have sent a password reset link.',
      });
      setIsSubmitted(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: axiosError.response?.data?.error || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if(isSubmitted) {
    return (
         <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
            <AnimatedSection>
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold font-headline">Request Sent</CardTitle>
                        <CardDescription>Please check your inbox for a link to reset your password. The link will expire in one hour.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href="/login">Back to Login</Link>
                         </Button>
                    </CardContent>
                </Card>
            </AnimatedSection>
         </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
        <AnimatedSection>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold font-headline">Forgot Password?</CardTitle>
                <CardDescription>No problem. Enter your email and we'll send you a link to reset it.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                    </Button>
                    </form>
                </Form>
                 <div className="mt-6 text-center text-sm">
                    Remember your password?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
                </CardContent>
            </Card>
        </AnimatedSection>
    </div>
  );
}
