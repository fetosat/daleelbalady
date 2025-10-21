'use client'

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use the dedicated AdminLayout with proper admin sidebar
  return <AdminLayout>{children}</AdminLayout>;
}
