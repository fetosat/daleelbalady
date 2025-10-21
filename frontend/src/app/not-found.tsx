'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search, MessageCircle, RefreshCcw } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 dark:from-stone-950 dark:via-background dark:to-green-950/20 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">د</span>
            </div>
          </div>

          {/* Error Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              الصفحة غير موجودة
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر
            </p>
          </motion.div>

          {/* Suggestions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">
                  ماذا تريد أن تفعل؟
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/">
                      <div className="flex items-center gap-3">
                        <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div className="text-right">
                          <p className="font-medium">العودة للرئيسية</p>
                          <p className="text-sm text-muted-foreground">الصفحة الرئيسية</p>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/find">
                      <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div className="text-right">
                          <p className="font-medium">البحث</p>
                          <p className="text-sm text-muted-foreground">ابحث عن الخدمات</p>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                      <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        العودة للرئيسية
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => window.history.back()}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      الصفحة السابقة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              هل تحتاج مساعدة؟{' '}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                تواصل معنا
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
