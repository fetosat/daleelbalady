import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: this.generateErrorId()
    });

    // Log error to external service
    this.logErrorToService(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 ErrorBoundary caught an error:', {
        error,
        errorInfo,
        errorId: this.state.errorId
      });
    }
  }

  private generateErrorId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    try {
      fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: localStorage.getItem('userId') || 'anonymous'
        })
      });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    });
  };

  private handleReportBug = () => {
    const bugReport = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Open email client with bug report
    const subject = encodeURIComponent(`Bug Report - Error ID: ${this.state.errorId}`);
    const body = encodeURIComponent(`
خطأ في التطبيق - Bug Report

معرف الخطأ: ${this.state.errorId}
الوقت: ${bugReport.timestamp}
الصفحة: ${bugReport.url}
رسالة الخطأ: ${bugReport.error}

يرجى وصف ما كنت تفعله عند حدوث الخطأ:
[اكتب هنا...]

تفاصيل إضافية:
المتصفح: ${bugReport.userAgent}
    `);
    
    window.location.href = `mailto:support@daleelbalady.com?subject=${subject}&body=${body}`;
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              عذراً، حدث خطأ!
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 mb-6">
              حدث خطأ غير متوقع في التطبيق. نعمل على حل هذه المشكلة.
            </p>

            {/* Error ID */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-500 mb-1">معرف الخطأ:</p>
              <p className="font-mono text-xs text-gray-700 select-all">
                {this.state.errorId}
              </p>
            </div>

            {/* Error Details (Development/Debug Mode) */}
            {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
              <details className="text-left bg-red-50 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer font-medium text-red-700 mb-2">
                  تفاصيل الخطأ التقنية
                </summary>
                <div className="text-xs font-mono text-red-600 whitespace-pre-wrap break-all">
                  <p><strong>Error:</strong> {this.state.error.message}</p>
                  {this.state.error.stack && (
                    <p className="mt-2"><strong>Stack:</strong> {this.state.error.stack}</p>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <p className="mt-2"><strong>Component:</strong> {this.state.errorInfo.componentStack}</p>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                حاول مرة أخرى
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                العودة للصفحة الرئيسية
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full bg-orange-100 text-orange-700 py-3 px-6 rounded-lg font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
              >
                <Bug className="w-4 h-4" />
                الإبلاغ عن المشكلة
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 mt-6">
              إذا استمرت المشكلة، يرجى التواصل معنا على support@daleelbalady.com
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher Order Component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
