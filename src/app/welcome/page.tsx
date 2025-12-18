'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LampContainer } from '@/components/ui/lamp';

export default function WelcomePage() {
  const router = useRouter();

  // Temporarily redirect to dashboard (no auth for now)
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <LampContainer className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-background bg-[radial-gradient(var(--grid-color)_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="glow-1 absolute -z-10" />
        <div className="glow-2 absolute -z-10" />
      </LampContainer>

      <div className="container relative z-10 mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          {/* Logo/Title */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-headline font-bold tracking-tight">
              RiskWise
            </h1>
          </div>

          <p className="mb-4 text-xl text-muted-foreground">
            Intelligent Risk & Issue Management Platform
          </p>
          <p className="mb-12 text-lg text-muted-foreground/80">
            Leverage AI-powered insights to proactively manage risks and resolve issues faster
          </p>

          {/* Feature Cards */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Get intelligent insights and recommendations from your risk data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Dashboards</CardTitle>
                <CardDescription>
                  Monitor risks and issues with comprehensive visual analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Similarity Detection</CardTitle>
                <CardDescription>
                  Automatically identify duplicate risks and issues before they escalate
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Redirect Message */}
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" onClick={() => router.push('/dashboard')} className="group">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Redirecting automatically...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

