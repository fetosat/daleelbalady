import { useAuth } from "@/lib/auth";
import * as React from "react";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: string;
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt instead of redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">🔒</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-stone-800">Authentication Required</h1>
            <p className="text-stone-600 mb-6">You need to be logged in to access this page.</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based authorization
  if (role && user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-stone-800">Access Denied</h1>
            <p className="text-stone-600 mb-6">You don't have permission to access this page.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
