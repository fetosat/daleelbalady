'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ServiceErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ServiceErrorBoundaryProps {
  children: ReactNode;
}

export class ServiceErrorBoundary extends Component<ServiceErrorBoundaryProps, ServiceErrorBoundaryState> {
  constructor(props: ServiceErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ServiceErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Service page error:', error);
    console.error('Error info:', errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // reportError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen pt-20 pb-16 bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Something went wrong
              </h2>
              <p className="text-text-secondary mb-4">
                Failed to load the service page. This might be a temporary issue.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error details (development)
                  </summary>
                  <pre className="mt-2 text-xs bg-stone-100 dark:bg-stone-800 p-2 rounded overflow-auto">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\nStack:\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
