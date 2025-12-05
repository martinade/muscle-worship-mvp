'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>No charges were made to your account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              Your payment was cancelled. You can try again whenever you're ready.
            </p>
          </div>

          <Button 
            onClick={() => router.push('/')} 
            className="w-full"
          >
            Return to Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
