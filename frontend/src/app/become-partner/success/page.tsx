'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Clock, FileCheck, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function ApplicationSuccessPage() {
  useEffect(() => {
    // Clear cached user data so next login gets fresh role
    if (typeof window !== 'undefined') {
      localStorage.removeItem('daleel-user');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Application Submitted Successfully!
            </h1>
            <p className="text-green-100 text-lg">
              Thank you for choosing Daleel Balady
            </p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
                What Happens Next?
              </h2>
              <p className="text-stone-600 dark:text-stone-400">
                Your application is now being reviewed by our team
              </p>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 dark:text-white mb-1">
                    Review Process (1-3 business days)
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Our team will carefully review your application and verify the information provided.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 dark:text-white mb-1">
                    Email Notification
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    You will receive an email notification once your application is approved or if we need additional information.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 dark:text-white mb-1">
                    Approval & Activation
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Once approved, your business profile will be activated and you can start using all the features of your selected plan.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="border-t pt-6 space-y-3">
              <h3 className="font-semibold text-stone-900 dark:text-white text-center mb-4">
                In the meantime...
              </h3>
              
              <Link href="/" className="block">
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>

              <Link href="/help" className="block">
                <Button variant="outline" className="w-full">
                  Learn More About Features
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mt-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>📧 Check your email!</strong> We sent a confirmation to your registered email address. 
                If you don't see it, please check your spam folder.
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-stone-600 dark:text-stone-400"
        >
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@daleelbalady.com" className="text-green-500 hover:underline">
              support@daleelbalady.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

