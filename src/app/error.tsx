'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <CardTitle>Something went wrong!</CardTitle>
                    </div>
                    <CardDescription>
                        An unexpected error occurred while rendering this page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm font-mono text-muted-foreground break-all">
                            {error.message}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={reset} className="flex-1">
                            Try again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/dashboard'}
                            className="flex-1"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && error.digest && (
                        <p className="text-xs text-muted-foreground">
                            Error digest: {error.digest}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
