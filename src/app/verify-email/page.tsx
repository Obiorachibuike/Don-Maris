
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AnimatedSection } from '@/components/animated-section';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token not found.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post('/api/auth/verify-email', { token });
        if (response.data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed. Please try again or request a new link.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
        <AnimatedSection>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                {status === 'verifying' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
                {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
                <p className="text-lg text-muted-foreground">{message}</p>
                {status === 'success' && (
                    <p className="text-sm text-muted-foreground">Redirecting to login...</p>
                )}
                 {status === 'error' && (
                    <Button asChild>
                        <Link href="/login">Go to Login</Link>
                    </Button>
                )}
                </CardContent>
            </Card>
        </AnimatedSection>
    </div>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
