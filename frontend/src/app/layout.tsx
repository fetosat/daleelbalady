import type { Metadata } from 'next'
import '../index.css'
import { Providers } from './providers'
import { Suspense } from 'react'
import { DynamicNavbar } from '@/components/DynamicNavbar'
import AuthSync from '@/components/AuthSync'
import Metrics from '@/components/Metrics'
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'دليل بلدي - نظام الخصومات والعروض',
    template: '%s | دليل بلدي'
  },
  description: 'منصة متكاملة للخصومات والعروض الحصرية مع نظام PIN الشهري ودعوات العائلة',
  keywords: 'خصومات, عروض, PIN, عائلة, دعوات',
  authors: [{ name: 'دليل بلدي' }],
  openGraph: {
    title: 'دليل بلدي - نظام الخصومات والعروض',
    description: 'منصة متكاملة للخصومات والعروض الحصرية مع نظام PIN الشهري ودعوات العائلة',
    type: 'website',
  },
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Metrics />

        <Providers>
          <AuthSync />
          <Suspense fallback={<div>Loading...</div>}>
            <DynamicNavbar />
            <main className="min-h-screen bg-background">
              {children}
            </main>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
