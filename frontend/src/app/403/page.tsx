'use client';

import { motion } from 'framer-motion';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
            >
              <ShieldOff className="w-12 h-12 text-red-500" />
            </motion.div>

            <div>
              <h1 className="text-6xl font-bold text-stone-900 dark:text-white mb-2">
                403
              </h1>
              <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-200 mb-2">
                Access Forbidden
              </h2>
              <p className="text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                You don't have permission to access this page. This area is restricted to specific user roles.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>🔒 Restricted Access</strong><br />
                If you believe you should have access to this page, please contact support or check your account permissions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>

              <Link href="/">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center space-x-2 w-full sm:w-auto">
                  <Home className="w-4 h-4" />
                  <span>Go to Homepage</span>
                </Button>
              </Link>
            </div>

            <div className="text-sm text-stone-500 dark:text-stone-400 pt-4 border-t">
              <p>
                Need help? Contact us at{' '}
                <a href="mailto:support@daleelbalady.com" className="text-green-500 hover:underline">
                  support@daleelbalady.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

