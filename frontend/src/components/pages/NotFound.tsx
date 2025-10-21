import { useEffect } from "react";
import Link from "next/link";

const NotFound = () => {
  useEffect(() => {
    // Only run on client side and log as warning instead of error
    if (typeof window !== 'undefined') {
      // Only log if it's not a known redirect path
      const path = window.location.pathname;
      if (!path.endsWith('/')) {
        console.warn("404: Page not found:", path);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-stone-600">Oops! Page not found</p>
        <Link href="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
