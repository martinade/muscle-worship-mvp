'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'completed' | 'pending' | 'error'>('loading');
  const [balance, setBalance] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID provided');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/status?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check payment status');
        }

        setStatus(data.status);
        if (data.balance !== undefined) {
          setBalance(data.balance);
        }
      } catch (error) {
        setStatus('error');
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        
        // Check for expired session
        if (errorMsg.includes('expired') || errorMsg.includes('not found')) {
          setErrorMessage('This payment link has expired. Payment links are valid for 24 hours. Please create a new payment to add funds to your wallet.');
        } else {
          setErrorMessage(errorMsg);
        }
      }
    };

    checkPaymentStatus();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <CardTitle>Processing Payment</CardTitle>
              <CardDescription>Please wait while we confirm your payment...</CardDescription>
            </>
          )}

          {status === 'completed' && (
            <>
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle>Payment Successful!</CardTitle>
              <CardDescription>Your wallet has been credited</CardDescription>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
              </div>
              <CardTitle>Payment Processing</CardTitle>
              <CardDescription>Your payment is being processed. This may take a few moments.</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <CardTitle className="text-destructive">Payment Error</CardTitle>
              <CardDescription>{errorMessage || 'An error occurred while processing your payment'}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'completed' && balance !== null && (
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">New Balance</p>
              <p className="text-3xl font-bold">{balance.toFixed(2)} WC</p>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your payment is being processed. You can safely close this page and check your wallet balance later.
              </p>
            </div>
          )}

          {status === 'error' && errorMessage.includes('expired') && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                ⏰ Payment Link Expired
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Stripe checkout sessions expire after 24 hours for security. Please create a new payment to add funds to your wallet.
              </p>
            </div>
          )}

          <Button 
            onClick={() => router.push('/')} 
            className="w-full"
            disabled={status === 'loading'}
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
